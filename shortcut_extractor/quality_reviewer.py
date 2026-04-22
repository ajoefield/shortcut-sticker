#!/usr/bin/env python3
"""
Quality Reviewer - Final validation and error checking for extracted shortcuts
Runs after all extractions to identify issues and create review reports
"""
import json
import csv
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class ApplicationReview:
    """Review results for a single application"""
    app_name: str
    platforms: Dict[str, int]  # platform -> shortcut count
    total_shortcuts: int
    status: str  # 'success', 'count_mismatch', 'missing_platform', 'malformed_data'
    issues: List[str]
    malformed_shortcuts: List[Dict]
    confidence_score: float

@dataclass
class QualityReport:
    """Overall quality report for all applications"""
    total_applications: int
    successful_apps: int
    problematic_apps: int
    total_shortcuts: int
    application_reviews: List[ApplicationReview]
    summary: Dict[str, int]

class QualityReviewer:
    """Reviews extraction quality and identifies issues"""
    
    def __init__(self, output_folder: Path, enable_ai_validation: bool = True):
        self.output_folder = output_folder
        self.latest_folder = output_folder / "csv_exports" / "latest"
        self.review_folder = output_folder / "csv_exports" / "review"
        self.review_folder.mkdir(exist_ok=True)
        self.enable_ai_validation = enable_ai_validation
        
        # Initialize AI validator if enabled
        self.ai_validator = None
        if enable_ai_validation:
            try:
                from ai_shortcut_validator import AIShortcutValidator
                self.ai_validator = AIShortcutValidator(aws_profile='developer playground')
                if not self.ai_validator.is_available():
                    print("   ⚠️  AI validation not available, using pattern-based validation only")
                    self.ai_validator = None
            except Exception as e:
                print(f"   ⚠️  Failed to initialize AI validator: {e}")
                self.ai_validator = None
        
        # Expected platform count ratios for cross-platform apps
        self.cross_platform_apps = {
            'rstudio': {'tolerance': 0.3},  # 30% tolerance
            'docker': {'tolerance': 0.2},   # 20% tolerance
            'kiro': {'tolerance': 0.3},     # 30% tolerance
            'intellij': {'tolerance': 0.2}, # 20% tolerance
            'vs code': {'tolerance': 0.2},  # 20% tolerance
            'vscode': {'tolerance': 0.2}    # 20% tolerance
        }
        
        # Malformed shortcut patterns
        self.malformed_patterns = [
            r'^[:\d/\s,]+$',  # Only timestamps/dates like ":37 / :37"
            r'^[+\s]+$',      # Only plus signs
            r'^[a-z]{1,2}$',  # Single letters like "end"
            r'^\w+\s*→\s*$',  # Arrows without content
            r'^[^\w\+]+$'     # Only symbols/punctuation
        ]
    
    def review_all_extractions(self) -> QualityReport:
        """Review all extracted shortcuts and generate quality report"""
        
        print("🔍 Starting Quality Review")
        print("=" * 50)
        
        if not self.latest_folder.exists():
            print(f"❌ Latest folder not found: {self.latest_folder}")
            return QualityReport(0, 0, 0, 0, [], {})
        
        # Group files by application
        app_files = self._group_files_by_application()
        
        print(f"📊 Found {len(app_files)} applications to review")
        
        # Review each application
        application_reviews = []
        total_shortcuts = 0
        
        for app_name, files in app_files.items():
            print(f"\n🔍 Reviewing {app_name}...")
            review = self._review_application(app_name, files)
            application_reviews.append(review)
            total_shortcuts += review.total_shortcuts
            
            # Print summary
            status_emoji = "✅" if review.status == 'success' else "⚠️" if 'mismatch' in review.status else "❌"
            print(f"   {status_emoji} {review.status.upper()}: {review.total_shortcuts} shortcuts across {len(review.platforms)} platforms")
            
            if review.issues:
                for issue in review.issues:
                    print(f"      • {issue}")
        
        # Generate overall report
        successful_apps = sum(1 for r in application_reviews if r.status == 'success')
        problematic_apps = len(application_reviews) - successful_apps
        
        report = QualityReport(
            total_applications=len(application_reviews),
            successful_apps=successful_apps,
            problematic_apps=problematic_apps,
            total_shortcuts=total_shortcuts,
            application_reviews=application_reviews,
            summary=self._generate_summary(application_reviews)
        )
        
        # Save reports
        self._save_quality_report(report)
        self._save_malformed_shortcuts(application_reviews)
        
        # Print final summary
        print("\n" + "=" * 50)
        print("📊 QUALITY REVIEW SUMMARY")
        print("=" * 50)
        print(f"📱 Applications reviewed: {report.total_applications}")
        print(f"✅ Successful: {report.successful_apps}")
        print(f"⚠️  Problematic: {report.problematic_apps}")
        print(f"🔍 Total shortcuts: {report.total_shortcuts}")
        print(f"📂 Review files saved to: {self.review_folder}")
        
        return report
    
    def _group_files_by_application(self) -> Dict[str, List[Path]]:
        """Group CSV files by application name"""
        
        app_files = defaultdict(list)
        
        for csv_file in self.latest_folder.glob("*_shortcuts_latest.csv"):
            # Extract app name from filename
            # Format: appname_platform_shortcuts_latest.csv
            parts = csv_file.stem.replace('_shortcuts_latest', '').split('_')
            
            if len(parts) >= 2:
                # Handle multi-word app names like "vs_code" or "intellij_idea"
                if parts[-1] in ['windows', 'macos', 'osa', 'unknown']:
                    app_name = '_'.join(parts[:-1])
                else:
                    app_name = '_'.join(parts)
                
                app_files[app_name].append(csv_file)
        
        return dict(app_files)
    
    def _review_application(self, app_name: str, files: List[Path]) -> ApplicationReview:
        """Review a single application's extraction results"""
        
        platforms = {}
        total_shortcuts = 0
        malformed_shortcuts = []
        all_shortcuts = []
        
        # Read all files for this application
        for file_path in files:
            platform = self._extract_platform_from_filename(file_path)
            shortcuts = self._read_shortcuts_from_csv(file_path)
            
            platforms[platform] = len(shortcuts)
            total_shortcuts += len(shortcuts)
            all_shortcuts.extend(shortcuts)
            
            # Check for malformed shortcuts
            malformed = self._find_malformed_shortcuts(shortcuts, file_path)
            # Set application name for each malformed shortcut
            for m in malformed:
                m['application'] = app_name
            malformed_shortcuts.extend(malformed)
        
        # Analyze results
        issues = []
        status = 'success'
        
        # Check for missing platforms (cross-platform apps should have both Windows and macOS)
        if self._is_cross_platform_app(app_name):
            if 'windows' not in platforms and 'unknown' not in platforms:
                issues.append("Missing Windows platform")
                status = 'missing_platform'
            
            if 'macos' not in platforms:
                issues.append("Missing macOS platform")
                status = 'missing_platform'
            
            # Check platform count balance
            windows_count = platforms.get('windows', 0) + platforms.get('unknown', 0)
            macos_count = platforms.get('macos', 0)
            
            if windows_count > 0 and macos_count > 0:
                ratio = abs(windows_count - macos_count) / max(windows_count, macos_count)
                tolerance = self.cross_platform_apps.get(app_name.lower(), {}).get('tolerance', 0.3)
                
                if ratio > tolerance:
                    issues.append(f"Platform count imbalance: Windows={windows_count}, macOS={macos_count} (ratio: {ratio:.1%})")
                    if status == 'success':
                        status = 'count_mismatch'
        
        # Check for malformed data
        if malformed_shortcuts:
            issues.append(f"Found {len(malformed_shortcuts)} malformed shortcuts")
            if status == 'success':
                status = 'malformed_data'
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(platforms, malformed_shortcuts, total_shortcuts)
        
        return ApplicationReview(
            app_name=app_name,
            platforms=platforms,
            total_shortcuts=total_shortcuts,
            status=status,
            issues=issues,
            malformed_shortcuts=malformed_shortcuts,
            confidence_score=confidence_score
        )
    
    def _extract_platform_from_filename(self, file_path: Path) -> str:
        """Extract platform from filename"""
        
        stem = file_path.stem.lower()
        
        if 'windows' in stem:
            return 'windows'
        elif 'macos' in stem:
            return 'macos'
        elif 'osa' in stem:
            return 'osa'
        elif 'unknown' in stem:
            return 'unknown'
        else:
            return 'other'
    
    def _read_shortcuts_from_csv(self, file_path: Path) -> List[Dict]:
        """Read shortcuts from CSV file"""
        
        shortcuts = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    shortcuts.append(row)
        except Exception as e:
            print(f"   ⚠️  Error reading {file_path.name}: {e}")
        
        return shortcuts
    
    def _find_malformed_shortcuts(self, shortcuts: List[Dict], file_path: Path) -> List[Dict]:
        """Find malformed shortcuts in the data"""
        
        import re
        malformed = []
        
        for shortcut in shortcuts:
            key_combo = shortcut.get('key_combination_standardized', '')
            title = shortcut.get('title', '')
            
            # Check for malformed key combinations
            is_malformed = False
            
            for pattern in self.malformed_patterns:
                if re.match(pattern, key_combo):
                    is_malformed = True
                    break
            
            # Check for empty or very short titles
            if len(title.strip()) < 2:
                is_malformed = True
            
            # Check for titles that are just symbols
            if re.match(r'^[^\w\s]+$', title.strip()):
                is_malformed = True
            
            if is_malformed:
                malformed.append({
                    'application': '',  # Will be filled by caller
                    'file': file_path.name,
                    'key_combination': key_combo,
                    'title': title,
                    'description': shortcut.get('description', ''),
                    'reason': 'malformed_pattern'
                })
        
        return malformed
    
    def _is_cross_platform_app(self, app_name: str) -> bool:
        """Check if app is expected to have cross-platform shortcuts"""
        
        app_lower = app_name.lower()
        return any(cross_app in app_lower for cross_app in self.cross_platform_apps.keys())
    
    def _calculate_confidence_score(self, platforms: Dict[str, int], 
                                   malformed_shortcuts: List[Dict], total_shortcuts: int) -> float:
        """Calculate confidence score for the application"""
        
        if total_shortcuts == 0:
            return 0.0
        
        score = 100.0
        
        # Deduct for malformed shortcuts
        malformed_ratio = len(malformed_shortcuts) / total_shortcuts
        score -= malformed_ratio * 50  # Up to 50 points deduction
        
        # Deduct for platform imbalance (cross-platform apps)
        if len(platforms) > 1:
            counts = list(platforms.values())
            if max(counts) > 0:
                balance_ratio = min(counts) / max(counts)
                score -= (1 - balance_ratio) * 20  # Up to 20 points deduction
        
        return max(0.0, min(100.0, score))
    
    def _generate_summary(self, reviews: List[ApplicationReview]) -> Dict[str, int]:
        """Generate summary statistics"""
        
        summary = {
            'total_apps': len(reviews),
            'successful_apps': sum(1 for r in reviews if r.status == 'success'),
            'count_mismatch_apps': sum(1 for r in reviews if r.status == 'count_mismatch'),
            'missing_platform_apps': sum(1 for r in reviews if r.status == 'missing_platform'),
            'malformed_data_apps': sum(1 for r in reviews if r.status == 'malformed_data'),
            'total_shortcuts': sum(r.total_shortcuts for r in reviews),
            'total_malformed': sum(len(r.malformed_shortcuts) for r in reviews),
            'avg_confidence': sum(r.confidence_score for r in reviews) / len(reviews) if reviews else 0
        }
        
        return summary
    
    def _save_quality_report(self, report: QualityReport):
        """Save quality report to JSON file"""
        
        report_file = self.review_folder / "quality_report.json"
        
        report_data = {
            'timestamp': self._get_timestamp(),
            'summary': {
                'total_applications': report.total_applications,
                'successful_apps': report.successful_apps,
                'problematic_apps': report.problematic_apps,
                'total_shortcuts': report.total_shortcuts,
                'statistics': report.summary
            },
            'applications': []
        }
        
        for review in report.application_reviews:
            app_data = {
                'name': review.app_name,
                'platforms': review.platforms,
                'total_shortcuts': review.total_shortcuts,
                'status': review.status,
                'issues': review.issues,
                'confidence_score': review.confidence_score,
                'malformed_count': len(review.malformed_shortcuts)
            }
            report_data['applications'].append(app_data)
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"   📋 Quality report saved: {report_file.name}")
    
    def _save_malformed_shortcuts(self, reviews: List[ApplicationReview]):
        """Save malformed shortcuts to separate file for review, with AI validation"""
        
        # Collect all malformed shortcuts
        all_malformed = []
        for review in reviews:
            all_malformed.extend(review.malformed_shortcuts)
        
        if not all_malformed:
            return
        
        # Apply AI validation if available
        if self.ai_validator:
            print(f"   🤖 AI validating {len(all_malformed)} potentially malformed shortcuts...")
            validated_malformed = self.ai_validator.validate_malformed_shortcuts(all_malformed)
        else:
            # Add default validation fields
            validated_malformed = []
            for malformed in all_malformed:
                malformed_copy = malformed.copy()
                malformed_copy.update({
                    'ai_validated': False,
                    'is_valid': False,
                    'validation_confidence': 0.0,
                    'validation_reason': 'Pattern-based detection only',
                    'suggested_correction': None
                })
                validated_malformed.append(malformed_copy)
        
        # Separate truly malformed from false positives
        confirmed_malformed = []
        false_positives = []
        
        for shortcut in validated_malformed:
            if shortcut.get('ai_validated', False):
                if shortcut.get('is_valid', False):
                    false_positives.append(shortcut)
                else:
                    confirmed_malformed.append(shortcut)
            else:
                # Without AI validation, keep as potentially malformed
                confirmed_malformed.append(shortcut)
        
        # Save confirmed malformed shortcuts
        malformed_file = self.review_folder / "malformed_shortcuts.csv"
        
        with open(malformed_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'application', 'file', 'key_combination', 'title', 'description', 
                'reason', 'ai_validated', 'is_valid', 'validation_confidence', 
                'validation_reason', 'suggested_correction'
            ])
            
            for shortcut in confirmed_malformed:
                writer.writerow([
                    shortcut.get('application', ''),
                    shortcut.get('file', ''),
                    shortcut.get('key_combination', ''),
                    shortcut.get('title', ''),
                    shortcut.get('description', ''),
                    shortcut.get('reason', ''),
                    shortcut.get('ai_validated', False),
                    shortcut.get('is_valid', False),
                    shortcut.get('validation_confidence', 0.0),
                    shortcut.get('validation_reason', ''),
                    shortcut.get('suggested_correction', '')
                ])
        
        # Save false positives (shortcuts flagged as malformed but AI says they're valid)
        if false_positives:
            false_positives_file = self.review_folder / "false_positives.csv"
            
            with open(false_positives_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'application', 'file', 'key_combination', 'title', 'description', 
                    'reason', 'validation_confidence', 'validation_reason'
                ])
                
                for shortcut in false_positives:
                    writer.writerow([
                        shortcut.get('application', ''),
                        shortcut.get('file', ''),
                        shortcut.get('key_combination', ''),
                        shortcut.get('title', ''),
                        shortcut.get('description', ''),
                        shortcut.get('reason', ''),
                        shortcut.get('validation_confidence', 0.0),
                        shortcut.get('validation_reason', '')
                    ])
            
            print(f"   ✅ False positives saved: {false_positives_file.name} ({len(false_positives)} entries)")
        
        if confirmed_malformed:
            print(f"   🚨 Confirmed malformed shortcuts saved: {malformed_file.name} ({len(confirmed_malformed)} entries)")
        
        if self.ai_validator and false_positives:
            print(f"   🎯 AI validation found {len(false_positives)} false positives out of {len(all_malformed)} flagged shortcuts")
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        import time
        return time.strftime("%Y%m%d_%H%M%S")

def main():
    """Test the quality reviewer"""
    
    output_folder = Path("../output")
    reviewer = QualityReviewer(output_folder)
    
    report = reviewer.review_all_extractions()
    
    print(f"\n📊 Review complete!")
    print(f"   Applications: {report.total_applications}")
    print(f"   Successful: {report.successful_apps}")
    print(f"   Issues: {report.problematic_apps}")

if __name__ == "__main__":
    main()