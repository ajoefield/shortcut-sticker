"""
Document Classifier - Determines PDF/PNG type and routes to appropriate extractor
"""
import PyPDF2
import fitz  # PyMuPDF
import re
import time
from pathlib import Path
from typing import Dict, Tuple, List
from dataclasses import dataclass
from enum import Enum
from PIL import Image

class DocumentType(Enum):
    TEXT_BASED = "text_based"
    IMAGE_BASED = "image_based" 
    HYBRID = "hybrid"
    CORRUPTED = "corrupted"
    PNG_IMAGE = "png_image"

class ExtractionMethod(Enum):
    DIRECT_TEXT = "direct_text"
    OCR_REQUIRED = "ocr_required"
    VISION_AI = "vision_ai"
    AI_ENHANCED = "ai_enhanced"
    MANUAL_REVIEW = "manual_review"

@dataclass
class ClassificationResult:
    document_type: DocumentType
    extraction_method: ExtractionMethod
    confidence: float
    software_name: str
    platform: str
    estimated_shortcuts: int
    complexity_score: int
    metadata: Dict

class DocumentClassifier:
    def __init__(self):
        self.software_patterns = {
            'jupyterlab': ['jupyterlab', 'jupyter lab', 'jupyter'],
            'vscode': ['vs code', 'visual studio code', 'vscode'],
            'vim': ['vim', 'neovim', 'nvim'],
            'sublime': ['sublime text', 'sublime'],
            'intellij': ['intellij', 'idea', 'jetbrains'],
            'docker': ['docker', 'container'],
            'rstudio': ['rstudio', 'r studio', 'rstudio ide'],
            'chrome': ['chrome', 'browser'],
            'kiro': ['kiro'],
            'figma': ['figma', 'design'],
            'notion': ['notion'],
            'photoshop': ['photoshop', 'ps', 'adobe'],
            'macos': ['mac', 'macos', 'apple', 'command'],
            'windows': ['windows', 'win', 'microsoft']
        }
        
        # OSA tools that should use "OSA" platform (Operating System Agnostic)
        self.osa_tools = {
            'vim': ['vim', 'neovim', 'nvim'],
            'emacs': ['emacs'],
            'nano': ['nano'],
            'git': ['git'],
            'tmux': ['tmux'],
            'screen': ['screen'],
            'bash': ['bash', 'shell'],
            'zsh': ['zsh'],
            'fish': ['fish shell'],
            'docker': ['docker'],  # Docker CLI commands
        }
    
    def classify_document(self, file_path: Path) -> ClassificationResult:
        """Main classification method for PDF and PNG files"""
        try:
            # Check file type
            if file_path.suffix.lower() == '.png':
                return self._classify_png_image(file_path)
            elif file_path.suffix.lower() == '.pdf':
                return self._classify_pdf_document(file_path)
            elif file_path.suffix.lower() == '.txt':
                return self._classify_txt_document(file_path)
            else:
                # Unsupported file type
                return ClassificationResult(
                    document_type=DocumentType.CORRUPTED,
                    extraction_method=ExtractionMethod.DIRECT_TEXT,
                    confidence=0.0,
                    software_name="Unknown",
                    platform="Unknown",
                    estimated_shortcuts=0,
                    complexity_score=0,
                    metadata={"error": "Unsupported file type"}
                )
        except Exception as e:
            return ClassificationResult(
                document_type=DocumentType.CORRUPTED,
                extraction_method=ExtractionMethod.DIRECT_TEXT,
                confidence=0.0,
                software_name="Unknown",
                platform="Unknown", 
                estimated_shortcuts=0,
                complexity_score=0,
                metadata={"error": str(e)}
            )
    
    def _classify_png_image(self, file_path: Path) -> ClassificationResult:
        """Classify PNG image file"""
        try:
            # Verify it's a valid image
            with Image.open(file_path) as img:
                width, height = img.size
                print(f"   📸 PNG Image: {width}x{height} pixels")
            
            # Extract software info from filename
            software_name, platform = self._identify_software_from_filename(file_path.name)
            
            # Estimate shortcuts based on image size (rough heuristic)
            estimated_shortcuts = min(max(10, (width * height) // 50000), 200)
            
            return ClassificationResult(
                document_type=DocumentType.PNG_IMAGE,
                extraction_method=ExtractionMethod.VISION_AI,
                confidence=90.0,
                software_name=software_name,
                platform=platform,
                estimated_shortcuts=estimated_shortcuts,
                complexity_score=3,  # Medium complexity for images
                metadata={
                    "image_width": width,
                    "image_height": height,
                    "file_size": file_path.stat().st_size
                }
            )
            
        except Exception as e:
            print(f"   ❌ PNG classification failed: {e}")
            return ClassificationResult(
                document_type=DocumentType.CORRUPTED,
                extraction_method=ExtractionMethod.VISION_AI,
                confidence=0.0,
                software_name="Unknown",
                platform="Unknown",
                estimated_shortcuts=0,
                complexity_score=0,
                metadata={"error": str(e)}
            )
    
    def _classify_txt_document(self, file_path: Path) -> ClassificationResult:
        """Classify TXT document"""
        try:
            # Read text content
            with open(file_path, 'r', encoding='utf-8') as f:
                text_content = f.read()
            
            print(f"   📝 TXT File: {len(text_content)} characters")
            
            # Extract software info from filename and content
            software_name, platform = self._identify_software_from_filename(file_path.name)
            
            # Estimate shortcuts based on content analysis
            estimated_shortcuts = self._estimate_shortcut_count(text_content)
            
            # Calculate complexity (text files are generally simpler)
            complexity = max(1, min(5, len(text_content) // 1000))  # Simple heuristic
            
            return ClassificationResult(
                document_type=DocumentType.TEXT_BASED,
                extraction_method=ExtractionMethod.DIRECT_TEXT,
                confidence=95.0,  # High confidence for text files
                software_name=software_name,
                platform=platform,
                estimated_shortcuts=estimated_shortcuts,
                complexity_score=complexity,
                metadata={
                    "text_length": len(text_content),
                    "file_size": file_path.stat().st_size,
                    "shortcut_patterns": self._count_shortcut_patterns(text_content)
                }
            )
            
        except Exception as e:
            print(f"   ❌ TXT classification failed: {e}")
            return ClassificationResult(
                document_type=DocumentType.CORRUPTED,
                extraction_method=ExtractionMethod.DIRECT_TEXT,
                confidence=0.0,
                software_name="Unknown",
                platform="Unknown",
                estimated_shortcuts=0,
                complexity_score=0,
                metadata={"error": str(e)}
            )
    
    def _classify_pdf_document(self, pdf_path: Path) -> ClassificationResult:
        """Classify PDF document (existing logic)"""
        try:
            # Basic file analysis
            file_size = pdf_path.stat().st_size
            
            # Extract text and analyze structure
            text_content = self._extract_text_content(pdf_path)
            image_analysis = self._analyze_images(pdf_path)
            
            # Determine document type
            doc_type = self._determine_document_type(text_content, image_analysis, file_size)
            
            # Identify software
            software_info = self._identify_software(pdf_path.name, text_content)
            
            # Calculate complexity and estimates
            complexity = self._calculate_complexity(text_content, image_analysis)
            estimated_shortcuts = self._estimate_shortcut_count(text_content)
            
            # Determine extraction method
            extraction_method = self._determine_extraction_method(
                doc_type, complexity, estimated_shortcuts, len(text_content)
            )
            
            # Calculate overall confidence
            confidence = self._calculate_confidence(
                doc_type, software_info, text_content, complexity
            )
            
            return ClassificationResult(
                document_type=doc_type,
                extraction_method=extraction_method,
                confidence=confidence,
                software_name=software_info['name'],
                platform=software_info['platform'],
                estimated_shortcuts=estimated_shortcuts,
                complexity_score=complexity,
                metadata={
                    'file_size': file_size,
                    'text_length': len(text_content),
                    'has_images': image_analysis['has_images'],
                    'image_count': image_analysis['image_count'],
                    'shortcut_patterns': self._count_shortcut_patterns(text_content)
                }
            )
            
        except Exception as e:
            return ClassificationResult(
                document_type=DocumentType.CORRUPTED,
                extraction_method=ExtractionMethod.MANUAL_REVIEW,
                confidence=0.0,
                software_name="Unknown",
                platform="Unknown",
                estimated_shortcuts=0,
                complexity_score=10,
                metadata={'error': str(e)}
            )
    
    def _extract_text_content(self, pdf_path: Path) -> str:
        """Extract text using multiple methods"""
        text = ""
        
        # Try PyPDF2 first
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        except:
            pass
        
        # If minimal text, try PyMuPDF
        if len(text.strip()) < 100:
            try:
                doc = fitz.open(pdf_path)
                for page in doc:
                    text += page.get_text() + "\n"
                doc.close()
            except:
                pass
        
        return text.strip()
    
    def _analyze_images(self, pdf_path: Path) -> Dict:
        """Analyze image content in PDF"""
        try:
            doc = fitz.open(pdf_path)
            image_count = 0
            total_image_area = 0
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                images = page.get_images()
                image_count += len(images)
                
                for img in images:
                    # Get image dimensions if possible
                    try:
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        total_image_area += len(base_image["image"])
                    except:
                        pass
            
            doc.close()
            
            return {
                'has_images': image_count > 0,
                'image_count': image_count,
                'total_image_area': total_image_area
            }
        except:
            return {'has_images': False, 'image_count': 0, 'total_image_area': 0}
    
    def _determine_document_type(self, text: str, image_analysis: Dict, file_size: int) -> DocumentType:
        """Determine if PDF is text-based or image-based"""
        text_length = len(text.strip())
        
        # Corrupted or empty
        if text_length == 0 and not image_analysis['has_images']:
            return DocumentType.CORRUPTED
        
        # Primarily text-based
        if text_length > 500 and self._has_structured_content(text):
            return DocumentType.TEXT_BASED
        
        # Image-heavy with minimal text
        if image_analysis['image_count'] > 0 and text_length < 200:
            return DocumentType.IMAGE_BASED
        
        # Mixed content
        if image_analysis['image_count'] > 0 and text_length > 200:
            return DocumentType.HYBRID
        
        # Default to image-based for small text content
        return DocumentType.IMAGE_BASED if text_length < 100 else DocumentType.TEXT_BASED
    
    def _has_structured_content(self, text: str) -> bool:
        """Check if text has structured shortcut content"""
        shortcut_patterns = [
            r'(Ctrl|Cmd|Alt|Shift)\s*\+',
            r'F\d+',
            r'⌘|⌥|⌃|⇧',  # Mac symbols
            r'\b[A-Z]\+[A-Z]\b'  # Key combinations
        ]
        
        pattern_count = sum(len(re.findall(pattern, text, re.IGNORECASE)) 
                          for pattern in shortcut_patterns)
        
        return pattern_count > 5
    
    def _identify_software(self, filename: str, text: str) -> Dict:
        """Identify application from filename and content"""
        filename_lower = filename.lower()
        text_lower = text.lower()
        
        # Check filename patterns first (more reliable)
        for software, patterns in self.software_patterns.items():
            if any(pattern in filename_lower for pattern in patterns):
                software_name = self._format_software_name(software)
                
                # First check for explicit platform in filename (highest priority)
                platform = self._detect_platform(text, filename)
                
                # Only check OSA if no explicit platform found and software is OSA-eligible
                if platform == 'Unknown' and self._is_osa_tool(software_name, filename, text):
                    return {'name': software_name, 'platform': 'OSA'}
                
                return {'name': software_name, 'platform': platform}
        
        # Check text content for software mentions
        for software, patterns in self.software_patterns.items():
            pattern_count = sum(text_lower.count(pattern) for pattern in patterns)
            if pattern_count > 2:
                software_name = self._format_software_name(software)
                
                # First check for explicit platform in filename (highest priority)
                platform = self._detect_platform(text, filename)
                
                # Only check OSA if no explicit platform found and software is OSA-eligible
                if platform == 'Unknown' and self._is_osa_tool(software_name, filename, text):
                    return {'name': software_name, 'platform': 'OSA'}
                
                return {'name': software_name, 'platform': platform}
        
        # Try to extract meaningful name from filename
        name = self._extract_application_name_from_filename(filename)
        platform = self._detect_platform_from_filename(filename)
        
        # Check if extracted name suggests OSA tool (only if no explicit platform)
        if platform == 'Unknown' and self._is_osa_tool(name, filename, text):
            return {'name': name, 'platform': 'OSA'}
        
        return {'name': name, 'platform': platform if platform != 'Unknown' else self._detect_platform(text, filename)}
    
    def _extract_application_name_from_filename(self, filename: str) -> str:
        """Extract application name from filename with better parsing"""
        # Remove file extension
        base_name = filename.replace('.pdf', '').replace('.png', '').replace('.txt', '')
        
        # Handle standard naming patterns
        parts = base_name.split('_')
        
        if len(parts) >= 2:
            # Pattern: ApplicationName_Platform_shortcuts or ApplicationName_Platform_screenshot
            app_name = parts[0]
            
            # Handle special cases
            if app_name.lower() == 'vs':
                return 'VS Code'
            elif app_name.lower() == 'mac':
                return 'macOS'
            elif app_name.lower() == 'win' or app_name.lower() == 'windows':
                return 'Windows'
            else:
                # Capitalize properly
                return app_name.replace('-', ' ').title()
        
        # Fallback: clean up the whole filename
        cleaned = base_name.replace('_', ' ').replace('-', ' ')
        
        # Remove common suffixes
        suffixes_to_remove = ['shortcuts', 'shortcut', 'keys', 'keyboard', 'cheatsheet', 'reference']
        for suffix in suffixes_to_remove:
            if cleaned.lower().endswith(suffix):
                cleaned = cleaned[:-len(suffix)].strip()
        
        return cleaned.title() if cleaned else 'Unknown'
    
    def _detect_platform_from_filename(self, filename: str) -> str:
        """Detect platform from filename with standardized naming convention"""
        filename_lower = filename.lower()
        
        # Standard naming convention patterns
        platform_patterns = {
            'macos': ['macos', 'mac_', '_mac', 'osx'],
            'windows': ['windows', 'win_', '_win', 'pc'],
            'osa': ['osa', '_osa', 'osa_'],
            'cross-platform': ['cross-platform', 'crossplatform', 'cross_platform', 'multiplatform', 'universal']
        }
        
        # Check for explicit platform indicators in filename
        for platform, patterns in platform_patterns.items():
            if any(pattern in filename_lower for pattern in patterns):
                if platform == 'cross-platform':
                    return 'Cross-platform'
                elif platform == 'macos':
                    return 'macOS'
                elif platform == 'windows':
                    return 'Windows'
                elif platform == 'osa':
                    return 'OSA'
        
        # If no platform found in filename, return Unknown
        return 'Unknown'
    
    def _is_osa_tool(self, software_name: str, filename: str = "", text: str = "") -> bool:
        """Check if the software is an OSA tool that should use OSA platform"""
        
        software_lower = software_name.lower()
        filename_lower = filename.lower()
        
        # Check if software matches known OSA tools
        for osa_tool, patterns in self.osa_tools.items():
            if any(pattern in software_lower for pattern in patterns):
                return True
        
        # Check filename for explicit OSA indicators (most reliable)
        if 'osa' in filename_lower:
            return True
        
        # Don't use text content for OSA detection as it's unreliable
        # Only rely on explicit software patterns and filename indicators
        return False
    
    def _detect_platform(self, text: str, filename: str = "") -> str:
        """Detect target platform from filename first, then text content"""
        
        # First try to detect from filename (more reliable)
        if filename:
            platform_from_filename = self._detect_platform_from_filename(filename)
            if platform_from_filename != 'Unknown':
                return platform_from_filename
        
        # Fallback to text analysis
        text_lower = text.lower()
        
        mac_indicators = ['cmd', 'command', '⌘', 'mac', 'macos', 'option', '⌥', '⇧', '⌃']
        windows_indicators = ['ctrl', 'windows', 'win', 'alt']
        
        mac_count = sum(text_lower.count(indicator) for indicator in mac_indicators)
        windows_count = sum(text_lower.count(indicator) for indicator in windows_indicators)
        
        if mac_count > windows_count and mac_count > 3:
            return 'macOS'
        elif windows_count > mac_count and windows_count > 3:
            return 'Windows'
        else:
            # Default to Cross-platform if unclear from text
            return 'Cross-platform'
    
    def _identify_software_from_filename(self, filename: str) -> Tuple[str, str]:
        """Identify software and platform from PNG filename"""
        filename_lower = filename.lower()
        
        # Check filename patterns
        for software, patterns in self.software_patterns.items():
            if any(pattern in filename_lower for pattern in patterns):
                # Detect platform from filename
                platform = self._detect_platform_from_filename(filename)
                return self._format_software_name(software), platform
        
        # Extract from filename if no match
        name = self._extract_application_name_from_filename(filename)
        platform = self._detect_platform_from_filename(filename)
        
        return name, platform
    
    def _format_software_name(self, software_key: str) -> str:
        """Format software name properly"""
        name_map = {
            'vscode': 'VS Code',
            'vim': 'Vim',
            'sublime': 'Sublime Text',
            'intellij': 'IntelliJ IDEA',
            'docker': 'Docker',
            'rstudio': 'RStudio',
            'macos': 'macOS',
            'windows': 'Windows',
            'chrome': 'Chrome',
            'figma': 'Figma',
            'kiro': 'Kiro',
            'notion': 'Notion',
            'photoshop': 'Photoshop',
            'jupyterlab': 'JupyterLab'
        }
        return name_map.get(software_key, software_key.title())
    
    def _count_shortcut_patterns(self, text: str) -> Dict:
        """Count different types of shortcut patterns"""
        patterns = {
            'cmd': len(re.findall(r'(Cmd|Command)\s*\+', text, re.IGNORECASE)),
            'ctrl': len(re.findall(r'Ctrl\s*\+', text, re.IGNORECASE)),
            'alt': len(re.findall(r'Alt\s*\+', text, re.IGNORECASE)),
            'shift': len(re.findall(r'Shift\s*\+', text, re.IGNORECASE)),
            'function_keys': len(re.findall(r'F\d+', text)),
            'mac_symbols': len(re.findall(r'[⌘⌥⌃⇧]', text))
        }
        return patterns
    
    def _calculate_complexity(self, text: str, image_analysis: Dict) -> int:
        """Calculate parsing complexity (1-10)"""
        complexity = 5
        
        # Text-based factors
        if len(text) < 100:
            complexity += 3
        elif len(text) > 2000:
            complexity -= 1
        
        # Structure factors
        if '|' in text and text.count('|') > 10:
            complexity -= 2  # Tables are easier
        
        if re.search(r'\s{3,}', text):
            complexity += 1  # Multiple spaces harder to parse
        
        # Image factors
        if image_analysis['has_images']:
            complexity += 2
        
        return max(1, min(10, complexity))
    
    def _estimate_shortcut_count(self, text: str) -> int:
        """Estimate number of shortcuts in document"""
        if not text:
            return 0
        
        patterns = self._count_shortcut_patterns(text)
        total_patterns = sum(patterns.values())
        
        # Estimate based on pattern density
        if total_patterns == 0:
            return 0
        elif total_patterns < 10:
            return total_patterns
        elif total_patterns > 100:
            return min(total_patterns // 2, 150)  # Likely concatenated text
        else:
            return int(total_patterns * 0.8)  # Account for duplicates
    
    def _determine_extraction_method(self, doc_type: DocumentType, complexity: int, 
                                   estimated_shortcuts: int, text_length: int) -> ExtractionMethod:
        """Determine best extraction method"""
        
        if doc_type == DocumentType.CORRUPTED:
            return ExtractionMethod.MANUAL_REVIEW
        
        if doc_type == DocumentType.IMAGE_BASED:
            return ExtractionMethod.OCR_REQUIRED
        
        if doc_type == DocumentType.TEXT_BASED:
            if complexity <= 6 and estimated_shortcuts > 5:
                return ExtractionMethod.DIRECT_TEXT
            elif complexity <= 8:
                return ExtractionMethod.AI_ENHANCED
            else:
                return ExtractionMethod.MANUAL_REVIEW
        
        # Hybrid documents
        if estimated_shortcuts > 10 and complexity <= 7:
            return ExtractionMethod.AI_ENHANCED
        else:
            return ExtractionMethod.OCR_REQUIRED
    
    def _calculate_confidence(self, doc_type: DocumentType, software_info: Dict, 
                            text: str, complexity: int) -> float:
        """Calculate overall confidence score"""
        confidence = 50.0
        
        # Document type confidence
        if doc_type == DocumentType.TEXT_BASED:
            confidence += 30
        elif doc_type == DocumentType.HYBRID:
            confidence += 10
        elif doc_type == DocumentType.IMAGE_BASED:
            confidence -= 20
        
        # Software identification confidence
        if software_info['name'] != 'Unknown':
            confidence += 20
        
        # Content quality
        shortcut_patterns = self._count_shortcut_patterns(text)
        if sum(shortcut_patterns.values()) > 10:
            confidence += 20
        elif sum(shortcut_patterns.values()) > 5:
            confidence += 10
        
        # Complexity penalty
        confidence -= (complexity - 5) * 3
        
        return max(0.0, min(100.0, confidence))

def main():
    """Test the classifier"""
    classifier = DocumentClassifier()
    
    source_folder = Path("source_keyboard_shortcuts")
    if not source_folder.exists():
        print("Source folder not found")
        return
    
    print("🔍 Classifying documents...")
    print("=" * 60)
    
    # Process all supported file types
    for file_pattern in ["*.pdf", "*.png", "*.txt"]:
        for file_path in source_folder.glob(file_pattern):
            result = classifier.classify_document(file_path)
            
            print(f"\n📄 {file_path.name}")
            print(f"   Type: {result.document_type.value}")
            print(f"   Method: {result.extraction_method.value}")
            print(f"   Software: {result.software_name} ({result.platform})")
            print(f"   Confidence: {result.confidence:.1f}%")
            print(f"   Estimated Shortcuts: {result.estimated_shortcuts}")
            print(f"   Complexity: {result.complexity_score}/10")

if __name__ == "__main__":
    main()