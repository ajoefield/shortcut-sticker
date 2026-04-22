#!/usr/bin/env python3
"""
Test PNG support for the shortcut extractor
"""
from pathlib import Path
from image_ai_parser import ImageAIParser
from document_classifier import DocumentClassifier, ClassificationResult

def test_png_support():
    """Test PNG image processing capabilities"""
    
    print("🧪 Testing PNG Support")
    print("=" * 40)
    
    # Initialize components
    try:
        classifier = DocumentClassifier()
        image_parser = ImageAIParser(aws_profile='developer playground')
        
        if not image_parser.is_available():
            print("❌ AWS Bedrock not available")
            return False
        
        print("✅ Components initialized")
        
        # Look for PNG files in the input directory
        input_folder = Path("../source_keyboard_shortcuts")
        png_files = list(input_folder.glob("*.png"))
        
        if not png_files:
            print(f"❌ No PNG files found in {input_folder}")
            print("   To test PNG support:")
            print("   1. Take a screenshot of keyboard shortcuts")
            print("   2. Save as PNG in source_keyboard_shortcuts/ directory")
            print("   3. Name it like: VSCode_macOS_screenshot.png")
            return False
        
        print(f"📁 Found {len(png_files)} PNG files:")
        for png_file in png_files:
            print(f"   📸 {png_file.name}")
        
        # Test with first PNG
        test_png = png_files[0]
        print(f"\n🔄 Testing with: {test_png.name}")
        
        # Step 1: Classify PNG
        classification = classifier.classify_document(test_png)
        print(f"   Software: {classification.software_name}")
        print(f"   Platform: {classification.platform}")
        print(f"   Document Type: {classification.document_type}")
        print(f"   Extraction Method: {classification.extraction_method}")
        
        # Step 2: Extract shortcuts
        if classification.extraction_method.value == "vision_ai":
            print(f"   🖼️  Extracting with Claude Vision...")
            shortcuts = image_parser.extract_shortcuts_from_image(test_png, classification)
            
            if shortcuts:
                print(f"   ✅ Extracted {len(shortcuts)} shortcuts!")
                
                # Show sample results
                print(f"\n📋 Sample shortcuts:")
                for i, shortcut in enumerate(shortcuts[:5], 1):
                    print(f"   {i}. {shortcut.key_combination} → {shortcut.title}")
                    print(f"      Confidence: {shortcut.confidence}%")
                
                return True
            else:
                print(f"   ❌ No shortcuts extracted")
                return False
        else:
            print(f"   ❌ Unexpected extraction method: {classification.extraction_method}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def create_sample_png_info():
    """Provide information about creating sample PNG files"""
    
    print("\n📝 How to Create Sample PNG Files:")
    print("=" * 40)
    print("1. **Take Screenshots:**")
    print("   - Open your favorite software (VS Code, Figma, etc.)")
    print("   - Navigate to keyboard shortcuts (Help → Keyboard Shortcuts)")
    print("   - Take a screenshot of the shortcuts list")
    
    print("\n2. **Save with Proper Naming:**")
    print("   - VSCode_macOS_screenshot.png")
    print("   - Figma_Windows_shortcuts.png") 
    print("   - Sublime_macOS_keymap.png")
    
    print("\n3. **Place in Input Directory:**")
    print("   - Save to: ../source_keyboard_shortcuts/")
    print("   - The system will auto-detect PNG files")
    
    print("\n4. **Best Practices for Screenshots:**")
    print("   - High resolution (at least 1200px wide)")
    print("   - Clear, readable text")
    print("   - Good contrast")
    print("   - Include shortcut descriptions if visible")
    
    print("\n5. **Supported Content:**")
    print("   - Menu screenshots with shortcuts")
    print("   - Keyboard shortcut reference cards")
    print("   - Settings panels showing key bindings")
    print("   - Cheat sheets and quick reference guides")

if __name__ == "__main__":
    success = test_png_support()
    
    if not success:
        create_sample_png_info()
    else:
        print(f"\n🎉 PNG support test completed successfully!")
        print(f"   The system can now extract shortcuts from both PDFs and PNG images!")
        print(f"   Use 'python run_extraction.py' to process all files")