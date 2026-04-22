"""
Multi-Stage Extraction Engine - Handles different PDF types with appropriate methods
"""
import PyPDF2
import fitz  # PyMuPDF
import re
import json
import cv2
import numpy as np
import io
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from PIL import Image
import pytesseract
from document_classifier import DocumentClassifier, ClassificationResult, ExtractionMethod

@dataclass
class ExtractedShortcut:
    software: str
    platform: str
    key_combination: str
    title: str
    description: str
    category: str
    confidence: float
    extraction_method: str
    source_page: int = 0

class ExtractionEngine:
    def __init__(self, use_ai: bool = False, aws_region: str = "us-east-1", aws_profile: Optional[str] = None):
        self.classifier = DocumentClassifier()
        self.use_ai = use_ai
        self.aws_region = aws_region
        self.aws_profile = aws_profile
        
        # Initialize AI reviewer if requested
        if use_ai:
            try:
                from ai_reviewer import AWSAIReviewer
                self.ai_reviewer = AWSAIReviewer(aws_region, aws_profile)
                if self.ai_reviewer.is_available():
                    print("🤖 AWS AI Reviewer enabled")
                else:
                    print("⚠️  AWS AI Reviewer not available, falling back to standard extraction")
                    self.ai_reviewer = None
            except ImportError:
                print("⚠️  AI reviewer module not found")
                self.ai_reviewer = None
        else:
            self.ai_reviewer = None
        
        # Shortcut patterns for validation
        self.shortcut_patterns = [
            r'(Ctrl|Cmd|Command|Alt|Shift|Option)\s*\+\s*[\w\+\s]+',
            r'F\d+',
            r'[⌘⌥⌃⇧]\s*[\w\+\s]*',
            r'\b[A-Z]\+[A-Z]\+?[A-Z]?\b'
        ]
    
    def extract_shortcuts(self, pdf_path: Path) -> Tuple[List[ExtractedShortcut], ClassificationResult]:
        """Main extraction method - routes to appropriate extractor with AI enhancement"""
        
        # Classify document first
        classification = self.classifier.classify_document(pdf_path)
        
        print(f"📄 Processing: {pdf_path.name}")
        print(f"   Method: {classification.extraction_method.value}")
        print(f"   Confidence: {classification.confidence:.1f}%")
        
        # Route to appropriate extraction method
        if classification.extraction_method == ExtractionMethod.DIRECT_TEXT:
            shortcuts = self._extract_direct_text(pdf_path, classification)
        elif classification.extraction_method == ExtractionMethod.OCR_REQUIRED:
            shortcuts = self._extract_with_ocr(pdf_path, classification)
        elif classification.extraction_method == ExtractionMethod.AI_ENHANCED:
            shortcuts = self._extract_with_ai(pdf_path, classification)
        else:
            shortcuts = []  # Manual review required
        
        # Post-process and validate
        shortcuts = self._post_process_shortcuts(shortcuts, classification)
        
        # Try specialized parsers for known problematic software or if few shortcuts found
        software_name = classification.software_name.lower()
        needs_specialized = (
            not shortcuts or  # No shortcuts found
            len(shortcuts) < 5 or  # Very few shortcuts
            'sublime' in software_name or  # Known problematic software
            'vim' in software_name or
            'rstudio' in software_name or
            'docker' in software_name
        )
        
        if needs_specialized:
            specialized_shortcuts = self._try_specialized_parsing(pdf_path, classification)
            if specialized_shortcuts and len(specialized_shortcuts) > len(shortcuts):
                print(f"   🔄 Specialized parser found more shortcuts ({len(specialized_shortcuts)} vs {len(shortcuts)})")
                shortcuts = specialized_shortcuts
        
        # Try Simple AI parsing if enabled and we still have few shortcuts
        if self.use_ai and len(shortcuts) < 50:  # Increased threshold to test Simple AI more often
            try:
                from simple_ai_parser import SimpleAIParser
                simple_ai = SimpleAIParser(aws_region=self.aws_region, aws_profile=self.aws_profile)
                
                if simple_ai.is_available():
                    print(f"   🤖 Trying Simple AI parser (current: {len(shortcuts)} shortcuts)...")
                    ai_shortcuts = simple_ai.extract_shortcuts_simple_ai(pdf_path, classification)
                    
                    if len(ai_shortcuts) > len(shortcuts):
                        print(f"   🚀 Simple AI found more shortcuts ({len(ai_shortcuts)} vs {len(shortcuts)})")
                        shortcuts = ai_shortcuts
                    else:
                        print(f"   ✅ Keeping existing shortcuts ({len(shortcuts)} >= {len(ai_shortcuts)})")
            except Exception as e:
                print(f"   ⚠️  Simple AI parser failed: {e}")
        
        # AI Review for low confidence shortcuts
        if self.ai_reviewer and shortcuts:
            shortcuts = self._ai_review_shortcuts(shortcuts, classification)
        
        return shortcuts, classification
    
    def _try_specialized_parsing(self, pdf_path: Path, classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Try specialized parsers for problematic PDFs"""
        try:
            from specialized_parsers import apply_specialized_parsing
            
            # Extract full text for specialized parsing
            text = self._extract_full_text(pdf_path)
            
            if text:
                print(f"   🔧 Trying specialized parser for {classification.software_name}...")
                shortcuts = apply_specialized_parsing(pdf_path, text, classification)
                
                if shortcuts:
                    print(f"   ✅ Specialized parser found {len(shortcuts)} shortcuts")
                    return shortcuts
                else:
                    print(f"   ⚠️  Specialized parser found no shortcuts")
            
        except ImportError:
            print("   ⚠️  Specialized parsers not available")
        except Exception as e:
            print(f"   ❌ Specialized parsing failed: {e}")
        
        return []
    
    def _ai_review_shortcuts(self, shortcuts: List[ExtractedShortcut], 
                           classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Use AI to review and improve shortcuts"""
        
        print("🤖 Starting AI review of extracted shortcuts...")
        
        # Review low confidence shortcuts
        review_results = self.ai_reviewer.review_low_confidence_shortcuts(
            shortcuts, classification, confidence_threshold=70.0
        )
        
        if not review_results:
            return shortcuts
        
        # Apply AI corrections
        improved_shortcuts = []
        corrections_made = 0
        
        for shortcut in shortcuts:
            # Find corresponding review result
            review_result = next(
                (r for r in review_results if r.original_shortcut == shortcut), 
                None
            )
            
            if review_result and review_result.is_valid:
                # Apply corrections if any
                corrected_shortcut = ExtractedShortcut(
                    software=shortcut.software,
                    platform=shortcut.platform,
                    key_combination=review_result.corrected_key or shortcut.key_combination,
                    title=review_result.corrected_title or shortcut.title,
                    description=review_result.corrected_description or shortcut.description,
                    category=shortcut.category,
                    confidence=max(shortcut.confidence, review_result.confidence),
                    extraction_method=f"{shortcut.extraction_method}+ai_reviewed",
                    source_page=shortcut.source_page
                )
                
                if (review_result.corrected_key or review_result.corrected_title or 
                    review_result.corrected_description):
                    corrections_made += 1
                
                improved_shortcuts.append(corrected_shortcut)
            elif review_result and not review_result.is_valid:
                # Skip invalid shortcuts identified by AI
                print(f"   🚫 AI rejected: {shortcut.key_combination} - {review_result.reasoning}")
            else:
                # Keep original if no review
                improved_shortcuts.append(shortcut)
        
        print(f"   ✅ AI review complete: {corrections_made} corrections made")
        print(f"   📊 Shortcuts after AI review: {len(improved_shortcuts)}")
        
        return improved_shortcuts
    
    def _extract_direct_text(self, pdf_path: Path, classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Extract from text-based PDFs using pattern matching"""
        shortcuts = []
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(reader.pages):
                    text = page.extract_text()
                    page_shortcuts = self._parse_text_content(
                        text, classification, page_num, "direct_text"
                    )
                    shortcuts.extend(page_shortcuts)
        
        except Exception as e:
            print(f"   ❌ Direct text extraction failed: {e}")
        
        return shortcuts
    
    def _extract_with_ocr(self, pdf_path: Path, classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Extract from image-based PDFs using OCR"""
        shortcuts = []
        
        # Try AWS Textract first if AI reviewer is available
        if self.ai_reviewer:
            print("   🔍 Trying AWS Textract OCR...")
            try:
                textract_shortcuts = self.ai_reviewer.review_with_textract_ocr(pdf_path, classification)
                if textract_shortcuts:
                    return textract_shortcuts
            except Exception as e:
                print(f"   ⚠️  AWS Textract failed, falling back to Tesseract: {e}")
        
        # Fallback to Tesseract OCR
        try:
            # Convert PDF pages to images
            doc = fitz.open(pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Render page as image
                mat = fitz.Matrix(2.0, 2.0)  # Higher resolution
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                
                # Convert to PIL Image
                img = Image.open(io.BytesIO(img_data))
                
                # Preprocess image for better OCR
                img_processed = self._preprocess_image_for_ocr(img)
                
                # Extract text with OCR
                ocr_text = pytesseract.image_to_string(
                    img_processed, 
                    config='--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+⌘⌥⌃⇧ :-'
                )
                
                # Parse OCR text
                page_shortcuts = self._parse_text_content(
                    ocr_text, classification, page_num, "tesseract_ocr"
                )
                shortcuts.extend(page_shortcuts)
            
            doc.close()
            
        except Exception as e:
            print(f"   ❌ Tesseract OCR extraction failed: {e}")
        
        return shortcuts
    
    def _extract_with_ai(self, pdf_path: Path, classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Extract using AI for complex layouts"""
        if not self.ai_reviewer:
            print("   ⚠️  AI extraction not configured, falling back to direct text")
            return self._extract_direct_text(pdf_path, classification)
        
        shortcuts = []
        
        try:
            # First try AWS Textract for OCR if needed
            if classification.document_type.value in ['image_based', 'hybrid']:
                print("   🔍 Using AWS Textract for OCR...")
                textract_shortcuts = self.ai_reviewer.review_with_textract_ocr(pdf_path, classification)
                shortcuts.extend(textract_shortcuts)
            
            # If no shortcuts from Textract or text-based PDF, try direct text + AI review
            if not shortcuts:
                shortcuts = self._extract_direct_text(pdf_path, classification)
            
        except Exception as e:
            print(f"   ❌ AI extraction failed: {e}")
            # Fallback to direct text
            shortcuts = self._extract_direct_text(pdf_path, classification)
        
        return shortcuts
    
    def _parse_text_content(self, text: str, classification: ClassificationResult, 
                          page_num: int, method: str) -> List[ExtractedShortcut]:
        """Parse text content for shortcuts using app-specific patterns"""
        shortcuts = []
        
        if not text.strip():
            return shortcuts
        
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # App-specific parsing logic
        app_name = classification.software_name.lower()
        
        if 'vs code' in app_name or 'vscode' in app_name:
            shortcuts.extend(self._parse_vscode_format(lines, classification, page_num, method))
        elif 'vim' in app_name:
            shortcuts.extend(self._parse_vim_format(lines, classification, page_num, method))
        elif 'sublime' in app_name:
            shortcuts.extend(self._parse_sublime_format(lines, classification, page_num, method))
        elif 'docker' in app_name:
            shortcuts.extend(self._parse_docker_format(lines, classification, page_num, method))
        else:
            shortcuts.extend(self._parse_generic_format(lines, classification, page_num, method))
        
        return shortcuts
    
    def _parse_vscode_format(self, lines: List[str], classification: ClassificationResult, 
                           page_num: int, method: str) -> List[ExtractedShortcut]:
        """Parse VS Code specific format"""
        shortcuts = []
        
        for line in lines:
            # VS Code patterns: "⇧⌘P, F1  Show Command Palette"
            if any(symbol in line for symbol in ['⇧', '⌘', '⌥', '⌃']) or \
               any(key in line.lower() for key in ['ctrl+', 'cmd+', 'alt+', 'shift+', 'f1']):
                
                # Try multiple separators
                for separator in ['  ', '\t', ' - ', ':']:
                    if separator in line:
                        parts = line.split(separator, 1)
                        if len(parts) == 2:
                            key = parts[0].strip()
                            desc = parts[1].strip()
                            
                            if key and desc and len(desc) > 3:
                                shortcuts.append(ExtractedShortcut(
                                    software=classification.software_name,
                                    platform=classification.platform,
                                    key_combination=key,
                                    title=desc,
                                    description=desc,
                                    category="General",
                                    confidence=self._calculate_shortcut_confidence(key, desc, method),
                                    extraction_method=method,
                                    source_page=page_num
                                ))
                                break
        
        return shortcuts
    
    def _parse_vim_format(self, lines: List[str], classification: ClassificationResult, 
                        page_num: int, method: str) -> List[ExtractedShortcut]:
        """Parse Vim specific format"""
        shortcuts = []
        
        for line in lines:
            # Vim patterns: "Ctrl+W - Window commands" or ":w - Save file"
            if any(pattern in line.lower() for pattern in ['ctrl+', ':', 'shift+']):
                
                for separator in [' - ', '  ', '\t', ':']:
                    if separator in line and line.count(separator) == 1:
                        parts = line.split(separator, 1)
                        if len(parts) == 2:
                            key = parts[0].strip()
                            desc = parts[1].strip()
                            
                            if key and desc:
                                shortcuts.append(ExtractedShortcut(
                                    software=classification.software_name,
                                    platform=classification.platform,
                                    key_combination=key,
                                    title=desc,
                                    description=desc,
                                    category="General",
                                    confidence=self._calculate_shortcut_confidence(key, desc, method),
                                    extraction_method=method,
                                    source_page=page_num
                                ))
                                break
        
        return shortcuts
    
    def _parse_sublime_format(self, lines: List[str], classification: ClassificationResult, 
                            page_num: int, method: str) -> List[ExtractedShortcut]:
        """Parse Sublime Text specific format"""
        shortcuts = []
        
        for line in lines:
            if any(key in line.lower() for key in ['ctrl+', 'cmd+', 'alt+', 'shift+']):
                
                for separator in [' - ', '  ', '\t']:
                    if separator in line:
                        parts = line.split(separator, 1)
                        if len(parts) == 2:
                            key = parts[0].strip()
                            desc = parts[1].strip()
                            
                            if any(k in key.lower() for k in ['ctrl', 'cmd', 'alt']) and len(desc) > 3:
                                shortcuts.append(ExtractedShortcut(
                                    software=classification.software_name,
                                    platform=classification.platform,
                                    key_combination=key,
                                    title=desc,
                                    description=desc,
                                    category="General",
                                    confidence=self._calculate_shortcut_confidence(key, desc, method),
                                    extraction_method=method,
                                    source_page=page_num
                                ))
                                break
        
        return shortcuts
    
    def _parse_docker_format(self, lines: List[str], classification: ClassificationResult, 
                           page_num: int, method: str) -> List[ExtractedShortcut]:
        """Parse Docker specific format"""
        shortcuts = []
        
        for line in lines:
            # Docker commands and shortcuts
            if any(word in line.lower() for word in ['docker', 'container', 'image']) or \
               any(key in line for key in ['ctrl', 'cmd', 'alt']):
                
                if ':' in line:
                    parts = line.split(':', 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        desc = parts[1].strip()
                        
                        if key and desc:
                            shortcuts.append(ExtractedShortcut(
                                software=classification.software_name,
                                platform=classification.platform,
                                key_combination=key,
                                title=desc,
                                description=desc,
                                category="General",
                                confidence=self._calculate_shortcut_confidence(key, desc, method),
                                extraction_method=method,
                                source_page=page_num
                            ))
        
        return shortcuts
    
    def _parse_generic_format(self, lines: List[str], classification: ClassificationResult, 
                            page_num: int, method: str) -> List[ExtractedShortcut]:
        """Generic parsing for unknown formats"""
        shortcuts = []
        
        for line in lines:
            # Look for any shortcut patterns
            for pattern in self.shortcut_patterns:
                matches = re.finditer(pattern, line, re.IGNORECASE)
                
                for match in matches:
                    key = match.group(0).strip()
                    
                    # Try to find description after the key
                    remaining_text = line[match.end():].strip()
                    
                    # Clean up description
                    desc = re.sub(r'^[:\-\s]+', '', remaining_text)
                    desc = desc.split('\t')[0].split('  ')[0]  # Take first part
                    
                    if desc and len(desc) > 3:
                        shortcuts.append(ExtractedShortcut(
                            software=classification.software_name,
                            platform=classification.platform,
                            key_combination=key,
                            title=desc,
                            description=desc,
                            category="General",
                            confidence=self._calculate_shortcut_confidence(key, desc, method),
                            extraction_method=method,
                            source_page=page_num
                        ))
        
        return shortcuts
    
    def _preprocess_image_for_ocr(self, img: Image.Image) -> Image.Image:
        """Preprocess image for better OCR results"""
        # Convert PIL to OpenCV
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to get better contrast
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Denoise
        denoised = cv2.medianBlur(thresh, 3)
        
        # Convert back to PIL
        return Image.fromarray(denoised)
    
    def _extract_full_text(self, pdf_path: Path) -> str:
        """Extract all text from PDF using multiple methods"""
        text = ""
        
        # Try PyPDF2
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        except:
            pass
        
        # If minimal text, try PyMuPDF
        if len(text.strip()) < 200:
            try:
                doc = fitz.open(pdf_path)
                for page in doc:
                    text += page.get_text() + "\n"
                doc.close()
            except:
                pass
        
        return text
    
    def _calculate_shortcut_confidence(self, key: str, description: str, method: str) -> float:
        """Calculate confidence score for extracted shortcut"""
        confidence = 50.0
        
        # Key pattern confidence
        if any(pattern in key.lower() for pattern in ['ctrl+', 'cmd+', 'alt+', 'shift+']):
            confidence += 25
        elif re.match(r'F\d+', key):
            confidence += 20
        elif any(symbol in key for symbol in ['⌘', '⌥', '⌃', '⇧']):
            confidence += 30
        
        # Description quality
        if len(description) > 10:
            confidence += 15
        elif len(description) > 5:
            confidence += 10
        
        # Method confidence
        if method == "direct_text":
            confidence += 10
        elif method == "ocr":
            confidence -= 15
        
        # Penalize if description looks like noise
        if re.search(r'[^\w\s\-\(\)]', description):
            confidence -= 10
        
        return max(0.0, min(100.0, confidence))
    
    def _post_process_shortcuts(self, shortcuts: List[ExtractedShortcut], 
                              classification: ClassificationResult) -> List[ExtractedShortcut]:
        """Clean and validate extracted shortcuts"""
        processed = []
        seen_combinations = set()
        
        for shortcut in shortcuts:
            # Clean key combination
            key = self._clean_key_combination(shortcut.key_combination)
            
            # Clean description
            desc = self._clean_description(shortcut.description)
            
            # Skip if too short or duplicate
            if len(key) < 2 or len(desc) < 3:
                continue
            
            key_lower = key.lower()
            if key_lower in seen_combinations:
                continue
            
            seen_combinations.add(key_lower)
            
            # Create cleaned shortcut
            processed.append(ExtractedShortcut(
                software=shortcut.software,
                platform=shortcut.platform,
                key_combination=key,
                title=desc,
                description=desc,
                category=shortcut.category,
                confidence=shortcut.confidence,
                extraction_method=shortcut.extraction_method,
                source_page=shortcut.source_page
            ))
        
        return processed
    
    def _clean_key_combination(self, key: str) -> str:
        """Clean and standardize key combination"""
        # Remove extra whitespace
        key = re.sub(r'\s+', ' ', key.strip())
        
        # Standardize separators
        key = re.sub(r'\s*\+\s*', '+', key)
        
        # Standardize key names
        replacements = {
            'command': 'Cmd',
            'control': 'Ctrl',
            'option': 'Alt',
            'return': 'Enter',
            'delete': 'Del'
        }
        
        for old, new in replacements.items():
            key = re.sub(old, new, key, flags=re.IGNORECASE)
        
        return key
    
    def _clean_description(self, desc: str) -> str:
        """Clean description text"""
        # Remove extra whitespace
        desc = re.sub(r'\s+', ' ', desc.strip())
        
        # Remove leading/trailing punctuation
        desc = re.sub(r'^[:\-\s]+|[:\-\s]+$', '', desc)
        
        # Capitalize first letter
        if desc:
            desc = desc[0].upper() + desc[1:]
        
        return desc

def main():
    """Test the extraction engine"""
    engine = ExtractionEngine()
    
    pdf_folder = Path("../source_keyboard_shortcuts")
    if not pdf_folder.exists():
        print("PDF folder not found")
        return
    
    print("🚀 Testing Extraction Engine")
    print("=" * 50)
    
    for pdf_file in list(pdf_folder.glob("*.pdf"))[:3]:  # Test first 3 files
        shortcuts, classification = engine.extract_shortcuts(pdf_file)
        
        print(f"\n📊 Results for {pdf_file.name}:")
        print(f"   Extracted: {len(shortcuts)} shortcuts")
        print(f"   Avg Confidence: {sum(s.confidence for s in shortcuts) / len(shortcuts):.1f}%" if shortcuts else "   No shortcuts found")
        
        # Show first few shortcuts
        for i, shortcut in enumerate(shortcuts[:3]):
            print(f"   {i+1}. {shortcut.key_combination} → {shortcut.title} ({shortcut.confidence:.1f}%)")

if __name__ == "__main__":
    main()