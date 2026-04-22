#!/usr/bin/env python3
"""
Force Extraction - Re-extract specific files or all files regardless of tracking
"""
import sys
from pathlib import Path
from simple_extraction_engine import SimpleExtractionEngine

def force_extract_all():
    """Force re-extraction of all files"""
    
    print("🔄 Force Re-extraction of All Files")
    print("=" * 40)
    
    # Initialize engine
    engine = SimpleExtractionEngine(aws_profile='developer playground')
    
    # Clear tracking to force re-extraction
    if engine.library_manager.versions_file.exists():
        engine.library_manager.versions_file.unlink()
        print("✅ Cleared version tracking - all files will be re-extracted")
    
    if engine.library_manager.metadata_file.exists():
        engine.library_manager.metadata_file.unlink()
        print("✅ Cleared metadata - fresh scan will be performed")
    
    # Run extraction
    input_folder = Path("../source_keyboard_shortcuts")
    output_folder = Path("../output")
    
    results = engine.extract_and_export(input_folder, output_folder)
    
    print(f"\n🎉 Force extraction complete!")
    print(f"   📁 Files processed: {len(results)}")
    print(f"   📊 Total shortcuts: {sum(len(r.shortcuts) for r in results if r.success)}")

def force_extract_software(software_names):
    """Force re-extraction of specific software"""
    
    print(f"🔄 Force Re-extraction of: {', '.join(software_names)}")
    print("=" * 40)
    
    # Initialize engine
    engine = SimpleExtractionEngine(aws_profile='developer playground')
    
    # Load current tracking
    engine.library_manager._load_software_versions()
    
    # Remove specific software from tracking
    removed_count = 0
    for software_name in software_names:
        # Find matching keys (case-insensitive, partial match)
        keys_to_remove = []
        for key in engine.library_manager.software_versions.keys():
            if any(name.lower() in key.lower() for name in software_names):
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del engine.library_manager.software_versions[key]
            removed_count += 1
            print(f"   🗑️  Removed tracking for: {key}")
    
    if removed_count == 0:
        print(f"   ⚠️  No matching software found in tracking")
        print(f"   Available software: {list(engine.library_manager.software_versions.keys())}")
        return
    
    # Save updated tracking
    engine.library_manager._save_software_versions()
    
    # Run extraction (will only process the removed software)
    input_folder = Path("../source_keyboard_shortcuts")
    output_folder = Path("../output")
    
    results = engine.extract_and_export(input_folder, output_folder)
    
    print(f"\n🎉 Force extraction complete!")
    print(f"   📁 Files processed: {len(results)}")
    print(f"   📊 Total shortcuts: {sum(len(r.shortcuts) for r in results if r.success)}")

def list_tracked_software():
    """List all currently tracked software"""
    
    print("📋 Currently Tracked Software")
    print("=" * 40)
    
    from library_manager import ShortcutLibraryManager
    manager = ShortcutLibraryManager()
    
    if not manager.versions_file.exists():
        print("❌ No tracking file found - no software has been processed yet")
        return
    
    versions = manager._load_software_versions()
    
    if not versions:
        print("❌ No software tracked yet")
        return
    
    print(f"📊 Total tracked: {len(versions)} software entries\n")
    
    for key, version in versions.items():
        print(f"🔹 {key}")
        print(f"   Software: {version.software_name}")
        print(f"   Platform: {version.platform}")
        print(f"   File: {version.pdf_filename}")
        print(f"   Shortcuts: {version.shortcut_count}")
        print(f"   Last Updated: {version.last_updated[:19]}")
        print()

def main():
    """Main CLI interface"""
    
    if len(sys.argv) < 2:
        print("🔄 Force Extraction Tool")
        print("=" * 30)
        print("Usage:")
        print("  python force_extraction.py all                    # Re-extract all files")
        print("  python force_extraction.py list                   # List tracked software")
        print("  python force_extraction.py vscode                 # Re-extract VS Code files")
        print("  python force_extraction.py sublime intellij       # Re-extract multiple software")
        print()
        print("Examples:")
        print("  python force_extraction.py all")
        print("  python force_extraction.py vscode")
        print("  python force_extraction.py macos windows")
        return
    
    command = sys.argv[1].lower()
    
    if command == "all":
        force_extract_all()
    elif command == "list":
        list_tracked_software()
    else:
        # Treat as software names
        software_names = [arg.lower() for arg in sys.argv[1:]]
        force_extract_software(software_names)

if __name__ == "__main__":
    main()