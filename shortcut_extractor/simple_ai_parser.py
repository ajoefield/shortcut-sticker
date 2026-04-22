#!/usr/bin/env python3
"""
Simple AI Parser - Uses Claude with a simpler, more reliable format
Avoids complex JSON parsing issues by using a structured text format
"""
import json
import boto3
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from extraction_engine import ExtractedShortcut
from document_classifier import ClassificationResult

class SimpleAIParser:
    def __init__(self, aws_region: str = "us-east-1", aws_profile: Optional[str] = None):
        """Initialize Simple AI Parser with AWS Bedrock"""
        self.region = aws_region
        self.profile = aws_profile
        
        try:
            if aws_profile:
                session = boto3.Session(profile_name=aws_profile)
                self.bedrock_client = session.client('bedrock-runtime', region_name=aws_region)
                print(f"✅ Simple AI Parser initialized with profile '{aws_profile}'")
            else:
                self.bedrock_client = boto3.client('bedrock-runtime', region_name=aws_region)
                print(f"✅ Simple AI Parser initialized in region: {aws_region}")
        except Exception as e:
            print(f"❌ AWS Bedrock initialization failed: {e}")
            self.bedrock_client = None
    
    def is_available(self) -> bool:
        """Check if AWS Bedrock is available"""
        return self.bedrock_client is not None
    
    def extract_shortcuts_simple_ai(self, pdf_path: Path, 
                                   classification: ClassificationResult) -> List[ExtractedShortcut]:
        """
        Simple AI extraction using structured text format instead of JSON
        More reliable than complex JSON parsing
        """
        import time
        start_time = time.time()
        
        if not self.is_available():
            raise Exception("AWS Bedrock not available")
        
        print(f"🤖 Simple AI extraction for: {pdf_path.name}")
        
        # Extract text using existing methods
        text = self._extract_text_fallback(pdf_path)
        
        # Use Claude with simple structured format
        shortcuts = self._extract_shortcuts_with_simple_claude(text, classification)
        
        processing_time = time.time() - start_time
        print(f"   ⏱️  Processing time: {processing_time:.2f}s")
        
        return shortcuts
    
    def _extract_text_fallback(self, pdf_path: Path) -> str:
        """Extract text from PDF, TXT, or PNG files"""
        try:
            # Handle text files directly
            if pdf_path.suffix.lower() == '.txt':
                with open(pdf_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                print(f"   📝 Read {len(text)} characters from TXT file")
                return text
            
            # Handle PNG files - return filename info for AI context
            elif pdf_path.suffix.lower() == '.png':
                # For PNG files, we'll let the AI parser handle them directly
                # Return minimal text context from filename
                filename_info = f"Image file: {pdf_path.name}\nThis is a screenshot of keyboard shortcuts."
                print(f"   🖼️ PNG file detected: {pdf_path.name}")
                return filename_info
            
            # Handle PDF files with PyMuPDF
            else:
                import fitz
                doc = fitz.open(pdf_path)
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()
                print(f"   📄 Extracted {len(text)} characters from PDF")
                return text
        except Exception as e:
            print(f"   ❌ Text extraction failed: {e}")
            return ""
    
    def _extract_shortcuts_with_simple_claude(self, text: str, 
                                            classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Use Claude with simple structured text format"""
        
        print("   🧠 Analyzing with Claude (simple format)...")
        
        # Analyze document structure first
        from document_structure_analyzer import DocumentStructureAnalyzer
        structure_analyzer = DocumentStructureAnalyzer()
        structure = structure_analyzer.analyze_structure(text)
        
        print(f"   📋 Document structure: {structure.format_type} format, {structure.platform_organization} platform organization")
        
        # Create simple prompt with structure context
        prompt = self._create_simple_prompt(text, classification, structure)
        
        # Call Claude
        response = self._call_claude(prompt)
        
        # Parse simple response format
        shortcuts = self._parse_simple_response(response, classification)
        
        print(f"   ✅ Claude extracted {len(shortcuts)} shortcuts")
        return shortcuts
    
    def _create_simple_prompt(self, text: str, classification: ClassificationResult, 
                            structure=None) -> str:
        """Create a simple prompt that returns structured text instead of JSON"""
        
        # Limit text to avoid token limits, but increase limit for cross-platform docs
        max_chars = 8000 if classification.platform == 'Cross-platform' else 6000
        limited_text = text[:max_chars] if len(text) > max_chars else text
        
        # Check if this is a cross-platform document with multiple sections
        has_multiple_platforms = ('macOS' in limited_text or 'Mac' in limited_text) and \
                               ('Windows' in limited_text or 'Ctrl' in limited_text)
        
        platform_instruction = ""
        if has_multiple_platforms:
            platform_instruction = """
CRITICAL: This document contains BOTH Windows and Mac shortcuts.
- This may be in TABLE FORMAT with columns like "Windows & Linux" and "Mac"
- OR in SECTION FORMAT with headers like "Windows", "macOS", etc.
- Extract shortcuts from ALL platforms you find
- For TABLE FORMAT: Look for rows with different shortcuts for each platform
- For SECTION FORMAT: Look for sections labeled by platform
- Create separate entries for Windows shortcuts (Ctrl, Alt, Shift) and Mac shortcuts (⌘, ⌥, ⇧, ⌃, Cmd)
- Do NOT skip any platform - extract from every platform you see
- If you see both "Ctrl+L" and "Cmd+L" for the same action, create TWO separate entries
"""
        
        # Add structure-based instructions
        structure_instruction = ""
        if structure and structure.confidence > 70:
            structure_instruction = f"""
DOCUMENT STRUCTURE ANALYSIS:
- Format: {structure.format_type.upper()} format detected
- Platform Organization: {structure.platform_organization.upper()}
"""
            if structure.layout_hints:
                structure_instruction += "- Layout Hints:\n"
                for hint in structure.layout_hints[:3]:  # Top 3 hints
                    structure_instruction += f"  * {hint}\n"
            
            structure_instruction += "\n"
        
        prompt = f"""You are an expert at extracting keyboard shortcuts from software documentation.

TASK: Extract ALL keyboard shortcuts from this {classification.software_name} document.
{structure_instruction}{platform_instruction}

DOCUMENT TEXT:
{limited_text}

INSTRUCTIONS:
1. Find every keyboard shortcut in the document from ALL sections
2. Look for patterns like: Ctrl+C, Cmd+Shift+P, ⌘+X, F1, :w, h, j, k, l
3. Extract the action/description for each shortcut
4. Handle concatenated text and poor formatting intelligently
5. If you see multiple platform sections, extract from ALL of them

RESPONSE FORMAT:
Return shortcuts in this EXACT format (one per line):
SHORTCUT: [key] | TITLE: [action] | PLATFORM: [platform] | CONFIDENCE: [1-100]

EXAMPLES:
SHORTCUT: Ctrl+C | TITLE: Copy selected text | PLATFORM: Windows | CONFIDENCE: 95
SHORTCUT: ⌘+V | TITLE: Paste clipboard content | PLATFORM: macOS | CONFIDENCE: 98
SHORTCUT: :w | TITLE: Save file | PLATFORM: Windows | CONFIDENCE: 90
SHORTCUT: h | TITLE: Move cursor left | PLATFORM: Windows | CONFIDENCE: 85

EXAMPLES FOR PLATFORM ASSIGNMENT:
- Source file: "Vim_OSA_shortcuts.pdf" → ALL shortcuts must be "OSA"
  SHORTCUT: Ctrl+R | TITLE: Redo | PLATFORM: OSA | CONFIDENCE: 95
  SHORTCUT: :w | TITLE: Save file | PLATFORM: OSA | CONFIDENCE: 90
- Source file: "VSCode_Windows_shortcuts.pdf" → ALL shortcuts must be "Windows"  
  SHORTCUT: Ctrl+C | TITLE: Copy | PLATFORM: Windows | CONFIDENCE: 95
- Source file: "VSCode_macOS_shortcuts.pdf" → ALL shortcuts must be "macOS"
  SHORTCUT: ⌘+C | TITLE: Copy | PLATFORM: macOS | CONFIDENCE: 95

ABSOLUTE PLATFORM RULES - NO EXCEPTIONS:
- The source file platform is: {classification.platform}
- If source is "OSA": ALL shortcuts (including Ctrl+R, Ctrl+V, etc.) must be "OSA"
- If source is "Windows": ALL shortcuts (including ⌘+C, Cmd+V, etc.) must be "Windows"  
- If source is "macOS": ALL shortcuts (including Ctrl+C, Alt+F, etc.) must be "macOS"
- If source is "Cross-platform": 
  * ANALYZE EACH SHORTCUT individually based on key combinations
  * Use "Windows" for shortcuts with Ctrl, Alt, Shift (e.g., Ctrl+L → Windows)
  * Use "macOS" for shortcuts with ⌘, Cmd, Option, ⌥, ⇧, ⌃ (e.g., Cmd+L → macOS)
  * Create SEPARATE entries for each platform version of the same action
  * Example: "Clear console" with "Ctrl+L" → Windows, "Cmd+L" → macOS (TWO separate entries)

CRITICAL EXTRACTION RULES:
- Extract EVERY shortcut you can find from ALL sections and columns
- Be generous - better to extract too many than miss shortcuts
- Use your understanding of {classification.software_name} to infer missing information
- For platform, use ONLY: Windows, macOS, or OSA
- DO NOT use "All", "Cross-platform", or "Linux" - only "Windows", "macOS", or "OSA"
- Confidence should reflect how clear the source text is
- SCAN THE ENTIRE DOCUMENT - don't stop after the first section

Extract shortcuts now (start each line with "SHORTCUT:"):"""
        
        return prompt
    
    def _call_claude(self, prompt: str, model_id: str = "anthropic.claude-3-haiku-20240307-v1:0") -> str:
        """Call AWS Bedrock Claude"""
        
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 3000,
            "temperature": 0.1,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        try:
            response = self.bedrock_client.invoke_model(
                modelId=model_id,
                body=json.dumps(request_body),
                contentType="application/json"
            )
            
            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']
            
        except Exception as e:
            print(f"   ❌ Claude API call failed: {e}")
            raise
    
    def _parse_simple_response(self, response: str, 
                             classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Parse simple structured text response"""
        
        shortcuts = []
        lines = response.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line.startswith('SHORTCUT:'):
                continue
            
            try:
                # Parse the structured format
                # SHORTCUT: [key] | TITLE: [action] | PLATFORM: [platform] | CONFIDENCE: [score]
                
                parts = line.split(' | ')
                if len(parts) < 3:
                    continue
                
                # Extract components
                shortcut_part = parts[0].replace('SHORTCUT:', '').strip()
                title_part = parts[1].replace('TITLE:', '').strip()
                platform_part = parts[2].replace('PLATFORM:', '').strip() if len(parts) > 2 else classification.platform
                confidence_part = parts[3].replace('CONFIDENCE:', '').strip() if len(parts) > 3 else '85'
                
                # Validate and clean - reject malformed entries
                if not shortcut_part or not title_part:
                    continue
                
                # Skip entries where platform contains invalid values
                if any(invalid in platform_part.upper() for invalid in ['CONFIDENCE:', 'TITLE:', 'SHORTCUT:']):
                    print(f"   ⚠️  Skipping malformed entry: {line[:50]}...")
                    continue
                
                # Skip entries where title contains invalid values  
                if any(invalid in title_part.upper() for invalid in ['CONFIDENCE:', 'PLATFORM:', 'SHORTCUT:']):
                    print(f"   ⚠️  Skipping malformed entry: {line[:50]}...")
                    continue
                
                # Skip entries where shortcut contains invalid values
                if any(invalid in shortcut_part.upper() for invalid in ['CONFIDENCE:', 'PLATFORM:', 'TITLE:']):
                    print(f"   ⚠️  Skipping malformed entry: {line[:50]}...")
                    continue
                
                # Validate platform is one of the expected values
                valid_platforms = ['Windows', 'macOS', 'OSA', 'Cross-platform']
                if platform_part not in valid_platforms:
                    print(f"   ⚠️  Invalid platform '{platform_part}', using source platform '{classification.platform}'")
                    platform_part = classification.platform
                
                try:
                    confidence = float(confidence_part)
                except:
                    confidence = 85.0
                
                # Create shortcut
                shortcut = ExtractedShortcut(
                    software=classification.software_name,
                    platform=platform_part,
                    key_combination=shortcut_part,
                    title=title_part,
                    description=title_part,
                    category="General",
                    confidence=confidence,
                    extraction_method="simple_ai_claude",
                    source_page=0
                )
                
                shortcuts.append(shortcut)
                
            except Exception as e:
                print(f"   ⚠️  Failed to parse line: {line[:50]}... ({e})")
                continue
        
        return shortcuts
    
    def compare_all_methods(self, pdf_path: Path, 
                          classification: ClassificationResult) -> Dict:
        """Compare Simple AI vs Traditional vs AI-First extraction"""
        
        print(f"\n🔬 COMPREHENSIVE COMPARISON: {pdf_path.name}")
        print("=" * 60)
        
        results = {}
        
        # 1. Simple AI extraction
        try:
            simple_ai_shortcuts = self.extract_shortcuts_simple_ai(pdf_path, classification)
            results['simple_ai'] = {
                'count': len(simple_ai_shortcuts),
                'shortcuts': [s.key_combination for s in simple_ai_shortcuts],
                'method': 'Simple AI (Claude + structured text)'
            }
        except Exception as e:
            print(f"❌ Simple AI failed: {e}")
            results['simple_ai'] = {'count': 0, 'shortcuts': [], 'error': str(e)}
        
        # 2. Traditional extraction
        try:
            from extraction_engine import ExtractionEngine
            traditional_engine = ExtractionEngine()
            traditional_shortcuts, _ = traditional_engine.extract_shortcuts(pdf_path)
            results['traditional'] = {
                'count': len(traditional_shortcuts),
                'shortcuts': [s.key_combination for s in traditional_shortcuts],
                'method': 'Traditional (regex + specialized parsers)'
            }
        except Exception as e:
            print(f"❌ Traditional failed: {e}")
            results['traditional'] = {'count': 0, 'shortcuts': [], 'error': str(e)}
        
        # 3. AI-First extraction (if available)
        try:
            from ai_first_parser import AIFirstParser
            ai_first_parser = AIFirstParser(aws_profile=self.profile)
            if ai_first_parser.is_available():
                ai_first_result = ai_first_parser.extract_shortcuts_ai_first(pdf_path, classification)
                results['ai_first'] = {
                    'count': len(ai_first_result.shortcuts),
                    'shortcuts': [s.key_combination for s in ai_first_result.shortcuts],
                    'method': 'AI-First (Textract + Claude JSON)'
                }
            else:
                results['ai_first'] = {'count': 0, 'shortcuts': [], 'error': 'Not available'}
        except Exception as e:
            print(f"❌ AI-First failed: {e}")
            results['ai_first'] = {'count': 0, 'shortcuts': [], 'error': str(e)}
        
        # Print comparison
        print(f"\n📊 RESULTS SUMMARY:")
        for method, data in results.items():
            if 'error' in data:
                print(f"   {method.upper()}: ❌ {data['error']}")
            else:
                print(f"   {method.upper()}: ✅ {data['count']} shortcuts ({data['method']})")
        
        # Find best method
        best_method = max(results.keys(), key=lambda k: results[k].get('count', 0))
        best_count = results[best_method].get('count', 0)
        
        if best_count > 0:
            print(f"\n🏆 WINNER: {best_method.upper()} with {best_count} shortcuts")
            
            # Show some examples from the best method
            best_shortcuts = results[best_method]['shortcuts'][:5]
            print(f"   Examples: {', '.join(best_shortcuts)}")
        
        return results

def main():
    """Test the Simple AI Parser"""
    
    parser = SimpleAIParser(aws_profile='developer playground')
    
    if not parser.is_available():
        print("❌ AWS Bedrock not available")
        return
    
    # Test files
    test_files = [
        'source_keyboard_shortcuts/Sublime Keyboard Shortcuts.pdf',
        'source_keyboard_shortcuts/Vim Cheat Sheet.pdf',
        'source_keyboard_shortcuts/RStudio keyboard Shortcut.pdf'
    ]
    
    from document_classifier import DocumentClassifier
    classifier = DocumentClassifier()
    
    for pdf_path in test_files:
        file = Path(pdf_path)
        if not file.exists():
            continue
        
        print(f"\n{'='*60}")
        print(f"TESTING: {file.name}")
        print('='*60)
        
        try:
            classification = classifier.classify_document(file)
            comparison = parser.compare_all_methods(file, classification)
            
        except Exception as e:
            print(f"❌ Error testing {file.name}: {e}")

if __name__ == "__main__":
    main()