#!/usr/bin/env python3
"""
Simple runner script for shortcut extraction
"""
from simple_extraction_engine import SimpleExtractionEngine
from pathlib import Path

def main():
    """Run the shortcut extraction pipeline"""
    
    print("🚀 Shortcut Extractor")
    print("=" * 30)
    
    try:
        # Initialize engine with correct library path
        if Path("source_keyboard_shortcuts").exists():
            pdf_folder = Path("source_keyboard_shortcuts")
            output_folder = Path("output")
            engine = SimpleExtractionEngine(aws_profile='developer playground', library_path=output_folder)
        elif Path("../source_keyboard_shortcuts").exists():
            pdf_folder = Path("../source_keyboard_shortcuts")
            output_folder = Path("../output")
            engine = SimpleExtractionEngine(aws_profile='developer playground', library_path=output_folder)
        else:
            print("❌ Cannot find source_keyboard_shortcuts directory")
            print("   Tried: ./source_keyboard_shortcuts and ../source_keyboard_shortcuts")
            return
        
        # Check if PDF folder exists
        if not pdf_folder.exists():
            print(f"❌ PDF folder not found: {pdf_folder}")
            print("   Please ensure source_keyboard_shortcuts directory exists")
            return
        
        # Run extraction
        results = engine.extract_and_export(pdf_folder, output_folder)
        
        # Show summary
        successful = sum(1 for r in results if r.success)
        total_shortcuts = sum(len(r.shortcuts) for r in results if r.success)
        
        print(f"\n🎉 Extraction Complete!")
        print(f"   ✅ Files processed: {successful}/{len(results)}")
        print(f"   📊 Total shortcuts: {total_shortcuts}")
        print(f"   📁 Output: {output_folder}/csv_exports/latest/")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("   Check AWS credentials and try again")

if __name__ == "__main__":
    main()