#!/usr/bin/env python3
"""
Test script for the Shortcut Extractor
"""
from pathlib import Path
from simple_extraction_engine import SimpleExtractionEngine

def test_extractor():
    """Test the shortcut extractor with a simple example"""
    
    print("🧪 Testing Shortcut Extractor")
    print("=" * 40)
    
    try:
        # Initialize engine
        engine = SimpleExtractionEngine(aws_profile='developer playground')
        print("✅ Engine initialized successfully")
        
        # Check if PDF folder exists
        pdf_folder = Path("../source_keyboard_shortcuts")
        if not pdf_folder.exists():
            print(f"❌ Source folder not found: {pdf_folder}")
            print("   Please ensure source_keyboard_shortcuts directory exists in the parent directory")
            return False
        
        # Check for PDF files
        pdf_files = list(pdf_folder.glob("*.pdf"))
        if not pdf_files:
            print(f"❌ No PDF files found in {pdf_folder}")
            return False
        
        print(f"📁 Found {len(pdf_files)} PDF files")
        
        # Test with first PDF
        test_pdf = pdf_files[0]
        print(f"🔄 Testing with: {test_pdf.name}")
        
        result = engine.extract_shortcuts(test_pdf)
        
        if result.success:
            print(f"✅ Extraction successful!")
            print(f"   📊 Extracted: {len(result.shortcuts)} shortcuts")
            print(f"   ⏱️  Time: {result.processing_time:.2f}s")
            print(f"   🏷️  Software: {result.classification.software_name}")
            print(f"   💻 Platform: {result.classification.platform}")
            
            # Show sample shortcuts
            if result.shortcuts:
                print(f"\n📋 Sample shortcuts:")
                for i, shortcut in enumerate(result.shortcuts[:3]):
                    print(f"   {i+1}. {shortcut.key_combination} → {shortcut.title}")
            
            return True
        else:
            print(f"❌ Extraction failed: {result.error_message}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_extractor()
    if success:
        print(f"\n🎉 Test completed successfully!")
        print(f"   Run 'python simple_extraction_engine.py' to process all PDFs")
    else:
        print(f"\n💥 Test failed - check configuration and try again")