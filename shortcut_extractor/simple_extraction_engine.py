#!/usr/bin/env python3
"""
Simple Extraction Engine - Uses ONLY Simple AI Parser for all extractions
No complex routing, no specialized parsers, just reliable AI-powered extraction
"""
import time
import json
from pathlib import Path
from typing import List, Tuple, Optional
from dataclasses import dataclass

from document_classifier import DocumentClassifier, ClassificationResult, ExtractionMethod
from simple_ai_parser import SimpleAIParser
from image_ai_parser import ImageAIParser
from extraction_engine import ExtractedShortcut
from key_standardizer import KeyStandardizer
from platform_splitter import PlatformSplitter
from library_manager import ShortcutLibraryManager

@dataclass
class SimpleExtractionResult:
    shortcuts: List[ExtractedShortcut]
    classification: ClassificationResult
    processing_time: float
    extraction_method: str = "simple_ai_only"
    success: bool = True
    error_message: Optional[str] = None

class SimpleExtractionEngine:
    def __init__(self, aws_region: str = "us-east-1", aws_profile: Optional[str] = None, library_path: Optional[Path] = None):
        """Initialize with Simple AI parser and Image AI parser"""
        self.classifier = DocumentClassifier()
        self.ai_parser = SimpleAIParser(aws_region=aws_region, aws_profile=aws_profile)
        self.image_parser = ImageAIParser(aws_region=aws_region, aws_profile=aws_profile)
        self.key_standardizer = KeyStandardizer()
        self.platform_splitter = PlatformSplitter()
        
        # Initialize library manager with correct path
        if library_path:
            self.library_manager = ShortcutLibraryManager(library_path)
        else:
            self.library_manager = ShortcutLibraryManager()
        
        if not self.ai_parser.is_available():
            raise Exception("AWS Bedrock not available - AI parsers require AWS access")
        
        print("✅ Simple Extraction Engine initialized (AI-only mode with platform splitting)")
    
    def extract_shortcuts(self, file_path: Path) -> SimpleExtractionResult:
        """Extract shortcuts using appropriate AI parser based on file type"""
        
        start_time = time.time()
        
        try:
            print(f"📄 Processing: {file_path.name}")
            
            # Step 1: Classify document (PDF or PNG)
            classification = self.classifier.classify_document(file_path)
            print(f"   Software: {classification.software_name}")
            print(f"   Platform: {classification.platform}")
            
            # Step 2: Analyze document structure first
            source_text = self._extract_text_for_analysis(file_path)
            
            from document_structure_analyzer import DocumentStructureAnalyzer
            structure_analyzer = DocumentStructureAnalyzer()
            structure = structure_analyzer.analyze_structure(source_text)
            
            print(f"   📋 Document structure: {structure.format_type} format, {structure.platform_organization} platform organization")
            
            # Step 3: Choose extraction method based on document structure
            print("   🤖 Choosing extraction method...")
            
            # Check if we can use direct table parsing (more reliable)
            if structure.format_type == 'table' and structure.platform_organization == 'columns':
                from table_parser import TableParser
                table_parser = TableParser()
                
                if table_parser.can_parse_table(source_text, structure):
                    print("   📊 Using direct table parser (more reliable)")
                    shortcuts = table_parser.parse_table_shortcuts(source_text, classification.software_name, structure)
                else:
                    # Fallback to AI
                    print("   🤖 Falling back to AI parser")
                    shortcuts = self.ai_parser.extract_shortcuts_simple_ai(file_path, classification)
            else:
                # Use AI parser for non-table documents
                print("   🤖 Using AI parser")
                shortcuts = self.ai_parser.extract_shortcuts_simple_ai(file_path, classification)
            
            # Step 4: Force OSA platform for OSA source files (AI sometimes ignores this)
            if classification.platform == 'OSA' and shortcuts:
                print(f"   🔧 Correcting platform to OSA for {len(shortcuts)} shortcuts...")
                for shortcut in shortcuts:
                    shortcut.platform = 'OSA'
            
            # Step 5: Process cross-platform documents (AI sometimes fails to extract mixed platforms)
            if classification.platform == 'Cross-platform' and shortcuts:
                from cross_platform_processor import CrossPlatformProcessor
                processor = CrossPlatformProcessor()
                
                original_count = len(shortcuts)
                shortcuts = processor.process_cross_platform_shortcuts(shortcuts, source_text)
                if len(shortcuts) > original_count:
                    print(f"   🔄 Cross-platform processing: {original_count} → {len(shortcuts)} shortcuts")
            
            # Step 6: Split cross-platform shortcuts into separate platform entries FIRST
            if shortcuts:
                print("   🔀 Splitting cross-platform shortcuts...")
                original_count = len(shortcuts)
                shortcuts = self.platform_splitter.split_shortcuts(shortcuts)
                
                if len(shortcuts) > original_count:
                    print(f"   ✨ Split {original_count} → {len(shortcuts)} platform-specific shortcuts")
                else:
                    print("   ✅ No cross-platform shortcuts to split")
            
            # Step 7: Smart fallback system - detect and fix extraction problems
            from smart_fallback_system import SmartFallbackSystem
            fallback_system = SmartFallbackSystem()
            
            # Check if we should use Python-first from the start for known problematic cases
            if fallback_system.should_use_python_first(classification, structure):
                print(f"   🐍 Using Python-first extraction for known problematic case")
                python_result = fallback_system.python_extractor.extract_shortcuts(
                    source_text, classification.software_name, classification
                )
                if len(python_result.shortcuts) > len(shortcuts):
                    print(f"   ✅ Python-first found {len(python_result.shortcuts)} vs {len(shortcuts)} shortcuts")
                    shortcuts = python_result.shortcuts
            
            # Check for problems and apply fallbacks (even if shortcuts is empty)
            fixed_shortcuts, was_fixed = fallback_system.check_and_fix_extraction(
                shortcuts, classification, source_text
            )
            
            if was_fixed:
                shortcuts = fixed_shortcuts
                print(f"   ✅ Smart fallback applied successfully")
            
            # Step 8: Key standardization - DISABLED for accuracy
            # TODO: Re-enable later for sticker space optimization (convert commands to symbols)
            # if shortcuts:
            #     print("   🔧 Standardizing key combinations...")
            #     standardized_shortcuts = self.key_standardizer.standardize_shortcuts_batch(shortcuts)
            #     
            #     # Update shortcuts with standardized keys
            #     for i, std_shortcut in enumerate(standardized_shortcuts):
            #         shortcuts[i].key_combination = std_shortcut.standardized_key
            #     
            #     print(f"   ✨ Standardized {len(shortcuts)} key combinations")
            
            print(f"   ⚠️  Key standardization disabled - preserving original formats")
            
            processing_time = time.time() - start_time
            
            print(f"   ✅ Extracted: {len(shortcuts)} shortcuts")
            print(f"   ⏱️  Time: {processing_time:.2f}s")
            
            return SimpleExtractionResult(
                shortcuts=shortcuts,
                classification=classification,
                processing_time=processing_time,
                success=True
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = str(e)
            
            print(f"   ❌ Extraction failed: {error_msg}")
            
            return SimpleExtractionResult(
                shortcuts=[],
                classification=classification if 'classification' in locals() else None,
                processing_time=processing_time,
                success=False,
                error_message=error_msg
            )
    
    def _extract_text_for_analysis(self, file_path: Path) -> str:
        """Extract text from file for cross-platform analysis"""
        try:
            if file_path.suffix.lower() == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            elif file_path.suffix.lower() == '.pdf':
                import fitz
                doc = fitz.open(file_path)
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()
                return text
            else:
                return ""
        except Exception as e:
            print(f"   ⚠️  Text extraction failed: {e}")
            return ""
    
    def smart_batch_extract(self, input_folder: Path) -> List[SimpleExtractionResult]:
        """Intelligently extract only files (PDF/PNG) that need updating"""
        
        # Find PDF, PNG, and TXT files
        pdf_files = list(input_folder.glob("*.pdf"))
        png_files = list(input_folder.glob("*.png"))
        txt_files = list(input_folder.glob("*.txt"))
        all_files = pdf_files + png_files + txt_files
        
        if not all_files:
            print(f"❌ No PDF, PNG, or TXT files found in {input_folder}")
            return []
        
        # Scan for changes first
        print(f"🔍 Scanning {len(all_files)} files ({len(pdf_files)} PDFs, {len(png_files)} PNGs, {len(txt_files)} TXTs) for changes...")
        status = self.library_manager.scan_for_changes(input_folder)
        
        # Filter to only files that need extraction
        files_to_extract = []
        skipped_count = 0
        
        for file_path in all_files:
            should_extract, reason = self.library_manager.should_extract(file_path)
            
            if should_extract:
                files_to_extract.append((file_path, reason))
                file_type = "🖼️ PNG" if file_path.suffix.lower() == '.png' else "📝 TXT" if file_path.suffix.lower() == '.txt' else "📄 PDF"
                print(f"   🔄 Will extract: {file_path.name} {file_type} ({reason})")
            else:
                skipped_count += 1
                print(f"   ⏭️  Skipping: {file_path.name} ({reason})")
        
        if not files_to_extract:
            print(f"✅ All {len(all_files)} files are up to date!")
            return []
        
        print(f"\n🚀 Starting Smart Extraction")
        print(f"📁 Extracting {len(files_to_extract)} files (skipping {skipped_count})")
        print("=" * 50)
        
        results = []
        total_shortcuts = 0
        total_time = 0
        
        for i, (file_path, reason) in enumerate(files_to_extract, 1):
            file_type = "🖼️ PNG" if file_path.suffix.lower() == '.png' else "📝 TXT" if file_path.suffix.lower() == '.txt' else "📄 PDF"
            print(f"\n🔄 Processing {i}/{len(files_to_extract)}: {file_path.name} {file_type}")
            print(f"   📝 Reason: {reason}")
            
            result = self.extract_shortcuts(file_path)
            results.append(result)
            
            if result.success:
                total_shortcuts += len(result.shortcuts)
                
                # Update library manager with new data
                application_key = self.library_manager._get_application_key(file_path.name)
                self.library_manager.update_application_version(application_key, file_path, result.shortcuts)
            
            total_time += result.processing_time
        
        # Print summary
        successful = sum(1 for r in results if r.success)
        failed = len(results) - successful
        
        print("\n" + "=" * 50)
        print("📊 SMART EXTRACTION SUMMARY")
        print("=" * 50)
        print(f"📁 Files processed: {len(files_to_extract)}")
        print(f"⏭️  Files skipped: {skipped_count}")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"🔍 Total shortcuts: {total_shortcuts}")
        print(f"⏱️  Total time: {total_time:.2f}s")
        print(f"📈 Average per file: {total_time/len(files_to_extract):.2f}s")
        print(f"🎯 Average shortcuts per file: {total_shortcuts/successful if successful > 0 else 0:.1f}")
        
        # Save library metadata
        self.library_manager.save_all()
        
        return results
        """Extract shortcuts from all PDFs in a folder"""
        
        pdf_files = list(pdf_folder.glob("*.pdf"))
        
        if not pdf_files:
            print(f"❌ No PDF files found in {pdf_folder}")
            return []
        
        print(f"🚀 Starting Simple AI batch extraction")
        print(f"📁 Found {len(pdf_files)} PDF files")
        print("=" * 50)
        
        results = []
        total_shortcuts = 0
        total_time = 0
        
        for i, pdf_file in enumerate(pdf_files, 1):
            print(f"\n🔄 Processing {i}/{len(pdf_files)}: {pdf_file.name}")
            
            result = self.extract_shortcuts(pdf_file)
            results.append(result)
            
            if result.success:
                total_shortcuts += len(result.shortcuts)
            
            total_time += result.processing_time
        
        # Print summary
        successful = sum(1 for r in results if r.success)
        failed = len(results) - successful
        
        print("\n" + "=" * 50)
        print("📊 SIMPLE AI BATCH EXTRACTION SUMMARY")
        print("=" * 50)
        print(f"📁 Files processed: {len(pdf_files)}")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"🔍 Total shortcuts: {total_shortcuts}")
        print(f"⏱️  Total time: {total_time:.2f}s")
        print(f"📈 Average per file: {total_time/len(pdf_files):.2f}s")
        print(f"🎯 Average shortcuts per file: {total_shortcuts/successful if successful > 0 else 0:.1f}")
        
        # Show per-software breakdown
        software_stats = {}
        for result in results:
            if result.success and result.classification:
                software = result.classification.software_name
                if software not in software_stats:
                    software_stats[software] = {'files': 0, 'shortcuts': 0}
                software_stats[software]['files'] += 1
                software_stats[software]['shortcuts'] += len(result.shortcuts)
        
        if software_stats:
            print(f"\n📱 By Software:")
            for software, stats in sorted(software_stats.items(), key=lambda x: x[1]['shortcuts'], reverse=True):
                print(f"   {software}: {stats['files']} files, {stats['shortcuts']} shortcuts")
        
        return results
    
    def extract_and_export(self, pdf_folder: Path, output_folder: Path) -> List[SimpleExtractionResult]:
        """Extract shortcuts and export to CSV files with versioning"""
        
        # Create output directories
        output_folder.mkdir(exist_ok=True)
        csv_folder = output_folder / "csv_exports"
        csv_folder.mkdir(exist_ok=True)
        
        # Generate version number for this run
        version = self._get_next_version(csv_folder)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        
        print(f"📊 Starting extraction run #{version:03d} at {timestamp}")
        
        # Extract shortcuts intelligently
        results = self.smart_batch_extract(pdf_folder)
        
        # Export to CSV files with versioning
        print(f"\n📊 Exporting results to versioned CSV files...")
        
        # Group shortcuts by application AND platform
        application_platform_shortcuts = {}
        
        for result in results:
            if result.success and result.shortcuts:
                application = result.classification.software_name.lower().replace(' ', '_')
                
                # Group by platform within each application
                for shortcut in result.shortcuts:
                    platform = shortcut.platform.lower().replace(' ', '_')
                    key = f"{application}_{platform}"
                    
                    if key not in application_platform_shortcuts:
                        application_platform_shortcuts[key] = []
                    
                    application_platform_shortcuts[key].append(shortcut)
        
        # Write versioned CSV files (one per application-platform combination)
        exported_files = []
        
        for app_platform_key, shortcuts in application_platform_shortcuts.items():
            # Create versioned filename with platform
            csv_file = csv_folder / f"{app_platform_key}_shortcuts_{version:03d}_{timestamp}.csv"
            
            with open(csv_file, 'w', newline='', encoding='utf-8') as f:
                # Write header - simplified since we're not standardizing
                f.write("application_name,platform,key_combination,title,description,category,confidence_score,extraction_method,run_version,timestamp\n")
                
                # Write shortcuts with version info (no standardization)
                for shortcut in shortcuts:
                    # Escape commas and quotes in CSV
                    def escape_csv(text):
                        if ',' in text or '"' in text or '\n' in text:
                            return '"' + text.replace('"', '""') + '"'
                        return text
                    
                    f.write(f"{escape_csv(shortcut.software)},")
                    f.write(f"{escape_csv(shortcut.platform)},")
                    f.write(f"{escape_csv(shortcut.key_combination)},")  # Original format preserved
                    f.write(f"{escape_csv(shortcut.title)},")
                    f.write(f"{escape_csv(shortcut.description)},")
                    f.write(f"{escape_csv(shortcut.category)},")
                    f.write(f"{shortcut.confidence},")
                    f.write(f"{escape_csv(shortcut.extraction_method)},")
                    f.write(f"{version:03d},")
                    f.write(f"{timestamp}\n")
            
            exported_files.append(csv_file)
            print(f"   ✅ {csv_file.name}: {len(shortcuts)} shortcuts")
        
        # Also create a "latest" symlink or copy for easy access
        self._create_latest_files(csv_folder, application_platform_shortcuts, version, timestamp)
        
        # Create run summary
        self._create_run_summary(csv_folder, results, version, timestamp)
        
        # Generate library index for sticker app
        if results:  # Only if we extracted something
            print(f"\n📚 Generating library index for sticker app...")
            self.library_manager.generate_library_index()
        
        # Run quality review as final step
        print(f"\n🔍 Running quality review...")
        from quality_reviewer import QualityReviewer
        reviewer = QualityReviewer(output_folder)
        quality_report = reviewer.review_all_extractions()
        
        print(f"\n📁 Versioned CSV files saved to: {csv_folder}")
        print(f"🔢 Run version: {version:03d}")
        
        return results
    
    def _get_next_version(self, csv_folder: Path) -> int:
        """Get the next version number by checking existing files"""
        
        # Look for existing versioned files
        existing_files = list(csv_folder.glob("*_shortcuts_*.csv"))
        
        if not existing_files:
            return 1
        
        # Extract version numbers from filenames
        versions = []
        for file in existing_files:
            # Pattern: software_shortcuts_001_timestamp.csv
            parts = file.stem.split('_')
            if len(parts) >= 3:
                try:
                    version_str = parts[-2]  # Second to last part should be version
                    if version_str.isdigit():
                        versions.append(int(version_str))
                except (ValueError, IndexError):
                    continue
        
        return max(versions) + 1 if versions else 1
    
    def _create_latest_files(self, csv_folder: Path, application_platform_shortcuts: dict, 
                           version: int, timestamp: str):
        """Create 'latest' versions of files for easy access"""
        
        latest_folder = csv_folder / "latest"
        latest_folder.mkdir(exist_ok=True)
        
        for app_platform_key, shortcuts in application_platform_shortcuts.items():
            latest_file = latest_folder / f"{app_platform_key}_shortcuts_latest.csv"
            
            with open(latest_file, 'w', newline='', encoding='utf-8') as f:
                # Write header - simplified without standardization
                f.write("application_name,platform,key_combination,title,description,category,confidence_score,extraction_method\n")
                
                # Write shortcuts without standardization
                for shortcut in shortcuts:
                    def escape_csv(text):
                        if ',' in text or '"' in text or '\n' in text:
                            return '"' + text.replace('"', '""') + '"'
                        return text
                    
                    f.write(f"{escape_csv(shortcut.software)},")
                    f.write(f"{escape_csv(shortcut.platform)},")
                    f.write(f"{escape_csv(shortcut.key_combination)},")  # Original format preserved
                    f.write(f"{escape_csv(shortcut.title)},")
                    f.write(f"{escape_csv(shortcut.description)},")
                    f.write(f"{escape_csv(shortcut.category)},")
                    f.write(f"{shortcut.confidence},")
                    f.write(f"{escape_csv(shortcut.extraction_method)}\n")
        
        print(f"   📂 Latest files created in: {latest_folder}")
    
    def _create_run_summary(self, csv_folder: Path, results: List[SimpleExtractionResult],
                          version: int, timestamp: str):
        """Create a summary file for this extraction run"""
        
        summary_file = csv_folder / f"extraction_summary_{version:03d}_{timestamp}.json"
        
        # Calculate statistics
        successful = sum(1 for r in results if r.success)
        failed = len(results) - successful
        total_shortcuts = sum(len(r.shortcuts) for r in results if r.success)
        total_time = sum(r.processing_time for r in results)
        
        # Application breakdown (by application-platform combination)
        application_stats = {}
        for result in results:
            if result.success and result.classification:
                application = result.classification.software_name
                if application not in application_stats:
                    application_stats[application] = {'files': 0, 'shortcuts': 0, 'avg_time': 0, 'platforms': set()}
                application_stats[application]['files'] += 1
                application_stats[application]['shortcuts'] += len(result.shortcuts)
                application_stats[application]['avg_time'] += result.processing_time
                
                # Track platforms for this application
                for shortcut in result.shortcuts:
                    application_stats[application]['platforms'].add(shortcut.platform)
        
        # Calculate averages and convert sets to lists
        for stats in application_stats.values():
            if stats['files'] > 0:
                stats['avg_time'] = stats['avg_time'] / stats['files']
            stats['platforms'] = list(stats['platforms'])  # Convert set to list for JSON
        
        summary_data = {
            "run_info": {
                "version": f"{version:03d}",
                "timestamp": timestamp,
                "extraction_method": "simple_ai_only"
            },
            "statistics": {
                "total_files": len(results),
                "successful_files": successful,
                "failed_files": failed,
                "total_shortcuts": total_shortcuts,
                "total_processing_time": round(total_time, 2),
                "avg_time_per_file": round(total_time / len(results), 2) if results else 0,
                "avg_shortcuts_per_file": round(total_shortcuts / successful, 1) if successful > 0 else 0
            },
            "application_breakdown": application_stats,
            "file_results": [
                {
                    "filename": result.classification.software_name if result.classification else "unknown",
                    "success": result.success,
                    "shortcuts_extracted": len(result.shortcuts),
                    "processing_time": round(result.processing_time, 2),
                    "error": result.error_message
                }
                for result in results
            ]
        }
        
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        print(f"   📋 Run summary saved: {summary_file.name}")

def main():
    """Test the Simple Extraction Engine"""
    
    # Initialize engine
    try:
        engine = SimpleExtractionEngine(aws_profile='developer playground')
    except Exception as e:
        print(f"❌ Failed to initialize: {e}")
        return
    
    # Test with PDF folder
    pdf_folder = Path("../source_keyboard_shortcuts")
    output_folder = Path("../output")
    
    if not pdf_folder.exists():
        print(f"❌ PDF folder not found: {pdf_folder}")
        return
    
    # Run extraction and export
    results = engine.extract_and_export(pdf_folder, output_folder)
    
    # Show some sample results
    print(f"\n📋 Sample Results:")
    for result in results[:3]:
        if result.success and result.shortcuts:
            print(f"\n{result.classification.software_name}:")
            for i, shortcut in enumerate(result.shortcuts[:3]):
                print(f"   {i+1}. {shortcut.key_combination} → {shortcut.title}")

if __name__ == "__main__":
    main()