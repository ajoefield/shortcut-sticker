#!/usr/bin/env python3
"""
Shortcut Library Manager - Intelligent tracking and updating of shortcut library
Handles software updates, version tracking, and change detection for the sticker app
"""
import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, asdict
from extraction_engine import ExtractedShortcut

@dataclass
class ApplicationVersion:
    """Track application version and extraction metadata"""
    application_name: str
    platform: str
    version: Optional[str] = None
    file_name: str = ""
    file_hash: str = ""
    extraction_date: str = ""
    shortcut_count: int = 0
    last_updated: str = ""
    extraction_version: int = 1

@dataclass
class LibraryStatus:
    """Overall library status and statistics"""
    total_applications: int = 0
    total_shortcuts: int = 0
    last_scan: str = ""
    needs_update: List[str] = None
    new_applications: List[str] = None
    updated_applications: List[str] = None

    def __post_init__(self):
        if self.needs_update is None:
            self.needs_update = []
        if self.new_applications is None:
            self.new_applications = []
        if self.updated_applications is None:
            self.updated_applications = []

class ShortcutLibraryManager:
    """Manages the shortcut library with intelligent update detection"""
    
    def __init__(self, library_path: Path = Path("../output")):
        self.library_path = library_path
        self.metadata_file = library_path / "library_metadata.json"
        self.versions_file = library_path / "application_versions.json"  # Updated filename
        self.library_index = library_path / "library_index.json"
        
        # Load existing metadata
        self.application_versions = self._load_application_versions()
        self.library_status = self._load_library_status()
    
    def _load_application_versions(self) -> Dict[str, ApplicationVersion]:
        """Load application version tracking data"""
        # Try new filename first, then fall back to old filename for compatibility
        if self.versions_file.exists():
            try:
                with open(self.versions_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return {
                        key: ApplicationVersion(**self._migrate_version_data(version_data)) 
                        for key, version_data in data.items()
                    }
            except Exception as e:
                print(f"⚠️  Warning: Could not load versions file: {e}")
        
        # Try old filename for backward compatibility
        old_versions_file = self.library_path / "software_versions.json"
        if old_versions_file.exists():
            try:
                with open(old_versions_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print("🔄 Migrating from software_versions.json to application_versions.json")
                    return {
                        key: ApplicationVersion(**self._migrate_version_data(version_data)) 
                        for key, version_data in data.items()
                    }
            except Exception as e:
                print(f"⚠️  Warning: Could not load old versions file: {e}")
        
        return {}
    
    def _migrate_version_data(self, old_data: Dict) -> Dict:
        """Migrate old software_version data to new application_version format"""
        migrated = {}
        
        # Map old field names to new ones
        field_mapping = {
            'software_name': 'application_name',
            'pdf_filename': 'file_name',
            'pdf_hash': 'file_hash'
        }
        
        for old_key, new_key in field_mapping.items():
            if old_key in old_data:
                migrated[new_key] = old_data[old_key]
        
        # Copy other fields as-is
        for key in ['platform', 'version', 'extraction_date', 'shortcut_count', 'last_updated', 'extraction_version']:
            if key in old_data:
                migrated[key] = old_data[key]
        
        # Set defaults for missing fields
        migrated.setdefault('application_name', 'Unknown')
        migrated.setdefault('platform', 'Unknown')
        migrated.setdefault('file_name', '')
        migrated.setdefault('file_hash', '')
        migrated.setdefault('extraction_date', '')
        migrated.setdefault('shortcut_count', 0)
        migrated.setdefault('last_updated', '')
        migrated.setdefault('extraction_version', 1)
        
        return migrated
    
    def _load_library_status(self) -> LibraryStatus:
        """Load library status data"""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Migrate old field names to new ones
                    migrated_data = self._migrate_library_status_data(data)
                    return LibraryStatus(**migrated_data)
            except Exception as e:
                print(f"⚠️  Warning: Could not load metadata file: {e}")
        return LibraryStatus()
    
    def _migrate_library_status_data(self, old_data: Dict) -> Dict:
        """Migrate old library status data to new format"""
        migrated = {}
        
        # Map old field names to new ones
        field_mapping = {
            'total_software': 'total_applications',
            'new_software': 'new_applications',
            'updated_software': 'updated_applications'
        }
        
        for old_key, new_key in field_mapping.items():
            if old_key in old_data:
                migrated[new_key] = old_data[old_key]
        
        # Copy other fields as-is
        for key in ['total_shortcuts', 'last_scan', 'needs_update']:
            if key in old_data:
                migrated[key] = old_data[key]
        
        # Set defaults for missing fields
        migrated.setdefault('total_applications', 0)
        migrated.setdefault('total_shortcuts', 0)
        migrated.setdefault('last_scan', '')
        migrated.setdefault('needs_update', [])
        migrated.setdefault('new_applications', [])
        migrated.setdefault('updated_applications', [])
        
        return migrated
    
    def _save_application_versions(self):
        """Save application version tracking data"""
        data = {
            key: asdict(version) 
            for key, version in self.application_versions.items()
        }
        with open(self.versions_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def _save_library_status(self):
        """Save library status data"""
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(self.library_status), f, indent=2, ensure_ascii=False)
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate hash of file (PDF or PNG) to detect changes"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        except Exception:
            return ""
    
    def _extract_version_from_filename(self, filename: str) -> Optional[str]:
        """Extract application version from filename if present"""
        # Look for version patterns like "VSCode_v1.85_macOS_shortcuts.pdf" or "VSCode_v1.85_screenshot.png"
        import re
        version_patterns = [
            r'_v(\d+\.\d+(?:\.\d+)?)_',  # _v1.85.2_
            r'_(\d+\.\d+(?:\.\d+)?)_',   # _1.85.2_
            r'_v(\d+\.\d+)_',            # _v1.85_
            r'_(\d{4})_',                # _2024_ (year)
        ]
        
        for pattern in version_patterns:
            match = re.search(pattern, filename)
            if match:
                return match.group(1)
        return None
    
    def scan_for_changes(self, input_folder: Path) -> LibraryStatus:
        """Scan input folder for PDF and PNG files and detect what needs updating"""
        
        print("🔍 Scanning for library changes...")
        
        # Find PDF, PNG, and TXT files
        pdf_files = list(input_folder.glob("*.pdf"))
        png_files = list(input_folder.glob("*.png"))
        txt_files = list(input_folder.glob("*.txt"))
        current_files = pdf_files + png_files + txt_files
        
        current_time = datetime.now(timezone.utc).isoformat()
        
        # Reset status tracking
        self.library_status.needs_update = []
        self.library_status.new_applications = []
        self.library_status.updated_applications = []
        
        # Track current applications
        current_applications = set()
        
        for file_path in current_files:
            # Parse filename for application info
            filename = file_path.name
            application_key = self._get_application_key(filename)
            current_applications.add(application_key)
            
            # Calculate file hash
            file_hash = self._calculate_file_hash(file_path)
            
            # Extract version if present
            version = self._extract_version_from_filename(filename)
            
            # Check if this is new or updated
            if application_key not in self.application_versions:
                # New application
                self.library_status.new_applications.append(application_key)
                file_type = "🖼️ PNG" if file_path.suffix.lower() == '.png' else "📝 TXT" if file_path.suffix.lower() == '.txt' else "📄 PDF"
                print(f"   🆕 New application detected: {application_key} {file_type}")
                
            else:
                # Check for updates
                existing = self.application_versions[application_key]
                
                # Check if file changed
                if existing.file_hash != file_hash:
                    self.library_status.updated_applications.append(application_key)
                    file_type = "🖼️ PNG" if file_path.suffix.lower() == '.png' else "📝 TXT" if file_path.suffix.lower() == '.txt' else "📄 PDF"
                    print(f"   🔄 Updated file detected: {application_key} {file_type}")
                
                # Check if version changed
                elif version and existing.version != version:
                    self.library_status.updated_applications.append(application_key)
                    print(f"   📈 Version update detected: {application_key} ({existing.version} → {version})")
        
        # Find removed applications
        removed_applications = set(self.application_versions.keys()) - current_applications
        for application_key in removed_applications:
            print(f"   🗑️  Removed application: {application_key}")
        
        # Update needs_update list
        self.library_status.needs_update = (
            self.library_status.new_applications + 
            self.library_status.updated_applications
        )
        
        # Update scan time
        self.library_status.last_scan = current_time
        
        print(f"📊 Scan complete:")
        print(f"   🆕 New: {len(self.library_status.new_applications)}")
        print(f"   🔄 Updated: {len(self.library_status.updated_applications)}")
        print(f"   📋 Total needs update: {len(self.library_status.needs_update)}")
        
        return self.library_status
    
    def _get_application_key(self, filename: str) -> str:
        """Generate consistent application key from filename"""
        # Remove file extension and normalize
        base = filename.replace('.pdf', '').replace('.png', '').replace('.txt', '')
        
        # Handle standard naming convention: Application_Platform_shortcuts
        parts = base.split('_')
        if len(parts) >= 2:
            application = parts[0]
            platform = parts[1] if parts[1] in ['macOS', 'Windows', 'Linux', 'Cross-platform'] else 'Unknown'
            return f"{application}_{platform}"
        
        # Fallback for non-standard names
        return base.replace(' ', '_').lower()
    
    def update_application_version(self, application_key: str, file_path: Path, 
                              shortcuts: List[ExtractedShortcut]):
        """Update version info after successful extraction"""
        
        filename = file_path.name
        file_hash = self._calculate_file_hash(file_path)
        version = self._extract_version_from_filename(filename)
        current_time = datetime.now(timezone.utc).isoformat()
        
        # Get existing version number or start at 1
        extraction_version = 1
        if application_key in self.application_versions:
            extraction_version = self.application_versions[application_key].extraction_version + 1
        
        # Parse application name and platform from shortcuts
        application_name = shortcuts[0].software if shortcuts else application_key.split('_')[0]
        platform = shortcuts[0].platform if shortcuts else application_key.split('_')[1]
        
        # Update version info
        self.application_versions[application_key] = ApplicationVersion(
            application_name=application_name,
            platform=platform,
            version=version,
            file_name=filename,
            file_hash=file_hash,
            extraction_date=current_time,
            shortcut_count=len(shortcuts),
            last_updated=current_time,
            extraction_version=extraction_version
        )
        
        print(f"   📝 Updated version info: {application_key} (v{extraction_version})")
    
    def should_extract(self, file_path: Path) -> Tuple[bool, str]:
        """Determine if a file (PDF or PNG) should be extracted"""
        
        application_key = self._get_application_key(file_path.name)
        
        # Always extract if new
        if application_key not in self.application_versions:
            return True, "New application"
        
        # Check if file changed
        current_hash = self._calculate_file_hash(file_path)
        existing = self.application_versions[application_key]
        
        if existing.file_hash != current_hash:
            return True, "File updated"
        
        # Check if version changed
        current_version = self._extract_version_from_filename(file_path.name)
        if current_version and existing.version != current_version:
            return True, f"Version update ({existing.version} → {current_version})"
        
        return False, "Up to date"
    
    def generate_library_index(self):
        """Generate searchable index for the sticker app"""
        
        print("📚 Generating library index...")
        
        # Load all latest CSV files
        csv_folder = self.library_path / "csv_exports" / "latest"
        
        if not csv_folder.exists():
            print("❌ No CSV exports found")
            return
        
        library_index = {
            "metadata": {
                "generated": datetime.now(timezone.utc).isoformat(),
                "total_applications": len(self.application_versions),
                "version": "1.0"
            },
            "applications": {},
            "shortcuts": [],
            "categories": set(),
            "platforms": set()
        }
        
        # Process each application CSV
        for csv_file in csv_folder.glob("*_shortcuts_latest.csv"):
            application_key = csv_file.stem.replace('_shortcuts_latest', '')
            
            try:
                shortcuts = self._load_shortcuts_from_csv(csv_file)
                
                if shortcuts:
                    # Add to application index
                    library_index["applications"][application_key] = {
                        "name": shortcuts[0]["application_name"],
                        "platform": shortcuts[0]["platform"],
                        "shortcut_count": len(shortcuts),
                        "version_info": asdict(self.application_versions.get(application_key, ApplicationVersion("", "")))
                    }
                    
                    # Add shortcuts with application reference
                    for shortcut in shortcuts:
                        shortcut["application_key"] = application_key
                        library_index["shortcuts"].append(shortcut)
                        library_index["categories"].add(shortcut["category"])
                        library_index["platforms"].add(shortcut["platform"])
                
            except Exception as e:
                print(f"⚠️  Warning: Could not process {csv_file}: {e}")
        
        # Convert sets to lists for JSON serialization
        library_index["categories"] = sorted(list(library_index["categories"]))
        library_index["platforms"] = sorted(list(library_index["platforms"]))
        
        # Save index
        with open(self.library_index, 'w', encoding='utf-8') as f:
            json.dump(library_index, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Library index generated:")
        print(f"   📱 Applications: {len(library_index['applications'])}")
        print(f"   ⌨️  Shortcuts: {len(library_index['shortcuts'])}")
        print(f"   📂 Categories: {len(library_index['categories'])}")
        print(f"   💻 Platforms: {len(library_index['platforms'])}")
    
    def _load_shortcuts_from_csv(self, csv_file: Path) -> List[Dict]:
        """Load shortcuts from CSV file"""
        import csv
        
        shortcuts = []
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                shortcuts.append(dict(row))
        
        return shortcuts
    
    def save_all(self):
        """Save all metadata files"""
        self._save_application_versions()
        self._save_library_status()
        print("💾 Metadata saved")
    
    def get_status_report(self) -> str:
        """Generate a status report for the library"""
        
        total_shortcuts = sum(v.shortcut_count for v in self.application_versions.values())
        
        report = f"""
📚 Shortcut Library Status Report
{'=' * 40}

📊 Overview:
   Applications: {len(self.application_versions)}
   Total Shortcuts: {total_shortcuts}
   Last Scan: {self.library_status.last_scan or 'Never'}

🔄 Pending Updates:
   New Applications: {len(self.library_status.new_applications)}
   Updated Applications: {len(self.library_status.updated_applications)}
   Total Needs Update: {len(self.library_status.needs_update)}

📱 By Platform:
"""
        
        # Platform breakdown
        platform_stats = {}
        for version in self.application_versions.values():
            platform = version.platform
            if platform not in platform_stats:
                platform_stats[platform] = {"count": 0, "shortcuts": 0}
            platform_stats[platform]["count"] += 1
            platform_stats[platform]["shortcuts"] += version.shortcut_count
        
        for platform, stats in sorted(platform_stats.items()):
            report += f"   {platform}: {stats['count']} apps, {stats['shortcuts']} shortcuts\n"
        
        if self.library_status.needs_update:
            report += f"\n🚨 Needs Update:\n"
            for application in self.library_status.needs_update:
                report += f"   - {application}\n"
        
        return report

def main():
    """Test the library manager"""
    
    manager = ShortcutLibraryManager()
    
    # Scan for changes
    pdf_folder = Path("../source_keyboard_shortcuts")
    status = manager.scan_for_changes(pdf_folder)
    
    # Generate index
    manager.generate_library_index()
    
    # Save metadata
    manager.save_all()
    
    # Show status report
    print(manager.get_status_report())

if __name__ == "__main__":
    main()