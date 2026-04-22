#!/usr/bin/env python3
"""
Image AI Parser - Extends Simple AI Parser to handle PNG images
Uses Claude Vision capabilities to extract shortcuts from screenshots
"""
import json
import boto3
import base64
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from PIL import Image
import io
from extraction_engine import ExtractedShortcut
from document_classifier import ClassificationResult

class ImageAIParser:
    def __init__(self, aws_region: str = "us-east-1", aws_profile: Optional[str] = None):
        """Initialize Image AI Parser with AWS Bedrock"""
        self.region = aws_region
        self.profile = aws_profile
        
        try:
            if aws_profile:
                session = boto3.Session(profile_name=aws_profile)
                self.bedrock_client = session.client('bedrock-runtime', region_name=aws_region)
                print(f"✅ Image AI Parser initialized with profile '{aws_profile}'")
            else:
                self.bedrock_client = boto3.client('bedrock-runtime', region_name=aws_region)
                print(f"✅ Image AI Parser initialized in region: {aws_region}")
        except Exception as e:
            print(f"❌ AWS Bedrock initialization failed: {e}")
            self.bedrock_client = None
    
    def is_available(self) -> bool:
        """Check if AWS Bedrock is available"""
        return self.bedrock_client is not None
    
    def extract_shortcuts_from_image(self, image_path: Path, classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Extract shortcuts from PNG image using Claude Vision"""
        
        print(f"🖼️  Image AI extraction for: {image_path.name}")
        
        try:
            # Load and process image
            image_data = self._prepare_image(image_path)
            
            if not image_data:
                print(f"   ❌ Could not process image: {image_path}")
                return []
            
            print(f"   📸 Image processed successfully")
            
            # Extract shortcuts using Claude Vision
            shortcuts = self._extract_shortcuts_with_claude_vision(image_data, classification)
            
            print(f"   ✅ Claude Vision extracted {len(shortcuts)} shortcuts")
            print(f"   ⏱️  Processing complete")
            
            return shortcuts
            
        except Exception as e:
            print(f"   ❌ Image extraction failed: {e}")
            return []
    
    def _prepare_image(self, image_path: Path) -> Optional[str]:
        """Prepare image for Claude Vision API"""
        
        try:
            # Open image with PIL
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize if too large (Claude has size limits)
                max_size = 1568  # Claude's max dimension
                if img.width > max_size or img.height > max_size:
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                    print(f"   📏 Resized image to {img.width}x{img.height}")
                
                # Convert to base64
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=85)
                image_bytes = buffer.getvalue()
                
                return base64.b64encode(image_bytes).decode('utf-8')
                
        except Exception as e:
            print(f"   ❌ Image preparation failed: {e}")
            return None
    
    def _extract_shortcuts_with_claude_vision(self, image_data: str, classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Extract shortcuts using Claude Vision model"""
        
        # Create vision prompt
        prompt = self._create_vision_prompt(classification)
        
        # Call Claude Vision
        response = self._call_claude_vision(prompt, image_data)
        
        if not response:
            return []
        
        # Parse response
        shortcuts = self._parse_claude_response(response, classification)
        
        return shortcuts
    
    def _create_vision_prompt(self, classification: ClassificationResult) -> str:
        """Create prompt for Claude Vision to extract shortcuts from image"""
        
        software_name = classification.software_name
        platform = classification.platform
        
    def _create_vision_prompt(self, classification: ClassificationResult) -> str:
        """Create prompt for Claude Vision to extract shortcuts from image"""
        
        software_name = classification.software_name
        platform = classification.platform
        
        # Check if this is a cross-platform document
        cross_platform_instruction = ""
        if platform == "Cross-platform":
            cross_platform_instruction = """
CRITICAL: This image contains shortcuts for MULTIPLE PLATFORMS (Mac and Windows).
- Look for TWO COLUMNS or SECTIONS - one for Mac, one for Windows
- The Mac column will have symbols like ⌘, ⌥, ⇧, ⌃ or text like "Cmd", "Option"
- The Windows column will have text like "Ctrl", "Alt", "Shift"
- Extract shortcuts from BOTH columns/sections
- Create separate entries for each platform version of the same shortcut
- Do NOT skip either column - extract from ALL visible sections
"""
        
        prompt = f"""You are analyzing a screenshot or image that contains keyboard shortcuts for {software_name}.
{cross_platform_instruction}

Your task is to extract ALL visible keyboard shortcuts from this image and format them in a structured way.

IMPORTANT INSTRUCTIONS:
1. Look for keyboard shortcuts in ANY format (text, tables, lists, menus, etc.)
2. Extract the key combination and its description/function
3. Pay attention to platform-specific notation:
   - Mac: ⌘ (Cmd), ⌥ (Option/Alt), ⇧ (Shift), ⌃ (Control)
   - Windows/Linux: Ctrl, Alt, Shift, Win
4. Include shortcuts even if they seem basic (Copy, Paste, etc.)
5. If you see categories or sections, note them
6. Be generous - extract everything that looks like a shortcut
7. SCAN THE ENTIRE IMAGE - look left, right, top, bottom for all shortcuts

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
SHORTCUT: [key combination] | TITLE: [short title] | DESCRIPTION: [longer description] | CATEGORY: [category if visible] | PLATFORM: [Mac/Windows] | CONFIDENCE: [0-100]

EXAMPLES:
SHORTCUT: ⌘+C | TITLE: Copy | DESCRIPTION: Copy selected text or item | CATEGORY: General | PLATFORM: Mac | CONFIDENCE: 100
SHORTCUT: Ctrl+Shift+P | TITLE: Command Palette | DESCRIPTION: Open command palette | CATEGORY: General | PLATFORM: Windows | CONFIDENCE: 95
SHORTCUT: F1 | TITLE: Help | DESCRIPTION: Show help documentation | CATEGORY: Help | PLATFORM: Windows | CONFIDENCE: 90

IMPORTANT PLATFORM RULES:
- Use "Mac" for shortcuts with ⌘, ⌥, ⇧, ⌃ symbols or "Cmd", "Option" text
- Use "Windows" for shortcuts with Ctrl, Alt, Shift, Win
- Use "OSA" for Operating System Agnostic tools like Vim, Git, Docker CLI commands, terminal shortcuts
- Linux shortcuts should be marked as "Windows" (they use the same key combinations)
- If you see both Mac and Windows versions, create separate entries for each
- DO NOT use "All", "Cross-platform", or "Linux" - only "Mac", "Windows", or "OSA"

IMPORTANT:
- Extract EVERY shortcut you can see in the image
- Be generous - better to extract too many than miss shortcuts
- If text is partially obscured, make your best guess and lower confidence
- If you can't read something clearly, skip it rather than guess wildly
- Look carefully at all parts of the image, including menus, sidebars, tooltips
- SCAN BOTH SIDES of the image if there are multiple columns

Now analyze the image and extract all keyboard shortcuts:"""

        return prompt

        return prompt
    
    def _call_claude_vision(self, prompt: str, image_data: str) -> Optional[str]:
        """Call Claude Vision API"""
        
        try:
            # Prepare the request for Claude 3 with vision
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_data
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            }
            
            print(f"   🧠 Analyzing image with Claude Vision...")
            
            # Call Bedrock
            response = self.bedrock_client.invoke_model(
                modelId="anthropic.claude-3-haiku-20240307-v1:0",
                body=json.dumps(request_body),
                contentType="application/json"
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            
            if 'content' in response_body and response_body['content']:
                return response_body['content'][0]['text']
            else:
                print(f"   ❌ No content in Claude response")
                return None
                
        except Exception as e:
            print(f"   ❌ Claude Vision API call failed: {e}")
            return None
    
    def _parse_claude_response(self, response: str, classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Parse Claude's structured response into ExtractedShortcut objects"""
        
        shortcuts = []
        lines = response.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or not line.startswith('SHORTCUT:'):
                continue
            
            try:
                # Parse the structured format
                shortcut_data = self._parse_shortcut_line(line)
                
                if shortcut_data:
                    # Normalize platform names
                    platform = shortcut_data.get('platform', classification.platform)
                    if platform == 'Mac':
                        platform = 'macOS'
                    elif platform == 'Windows':
                        platform = 'Windows'
                    elif platform == 'CLI' or platform == 'cli':
                        platform = 'CLI'
                    
                    shortcut = ExtractedShortcut(
                        software=classification.software_name,
                        platform=platform,
                        key_combination=shortcut_data['shortcut'],
                        title=shortcut_data['title'],
                        description=shortcut_data['description'],
                        category=shortcut_data.get('category', 'General'),
                        confidence=float(shortcut_data.get('confidence', 85)),
                        extraction_method="claude_vision"
                    )
                    shortcuts.append(shortcut)
                    
            except Exception as e:
                print(f"   ⚠️  Could not parse line: {line[:50]}... ({e})")
                continue
        
        return shortcuts
    
    def _parse_shortcut_line(self, line: str) -> Optional[Dict[str, str]]:
        """Parse a single shortcut line from Claude's response"""
        
        # Expected format: SHORTCUT: key | TITLE: title | DESCRIPTION: desc | CATEGORY: cat | PLATFORM: plat | CONFIDENCE: conf
        
        parts = line.split(' | ')
        data = {}
        
        for part in parts:
            if ':' in part:
                key, value = part.split(':', 1)
                key = key.strip().lower()
                value = value.strip()
                
                if key == 'shortcut':
                    data['shortcut'] = value
                elif key == 'title':
                    data['title'] = value
                elif key == 'description':
                    data['description'] = value
                elif key == 'category':
                    data['category'] = value
                elif key == 'platform':
                    data['platform'] = value
                elif key == 'confidence':
                    data['confidence'] = value
        
        # Validate required fields
        if 'shortcut' in data and 'title' in data:
            # Set defaults for missing fields
            data.setdefault('description', data['title'])
            data.setdefault('category', 'General')
            data.setdefault('platform', 'All')
            data.setdefault('confidence', '85')
            
            return data
        
        return None

def main():
    """Test the image AI parser"""
    
    # Test with a sample image (you would need to provide one)
    parser = ImageAIParser(aws_profile='developer playground')
    
    if not parser.is_available():
        print("❌ AWS Bedrock not available")
        return
    
    # Create a test classification
    test_classification = ClassificationResult(
        software_name="VS Code",
        platform="macOS",
        document_type=None,
        extraction_method=None,
        confidence=100.0,
        processing_time=0.0
    )
    
    # Test image path (you would need to provide an actual image)
    test_image = Path("test_shortcut_screenshot.png")
    
    if test_image.exists():
        print(f"🧪 Testing image extraction with: {test_image}")
        shortcuts = parser.extract_shortcuts_from_image(test_image, test_classification)
        
        print(f"\n📊 Results:")
        print(f"   Extracted: {len(shortcuts)} shortcuts")
        
        for i, shortcut in enumerate(shortcuts[:5], 1):
            print(f"   {i}. {shortcut.key_combination} → {shortcut.title}")
    else:
        print(f"❌ Test image not found: {test_image}")
        print("   Create a PNG screenshot of keyboard shortcuts to test")

if __name__ == "__main__":
    main()