#!/usr/bin/env python3
"""
Document Structure Analyzer - Analyzes document layout and structure
to provide better context to AI parsers
"""
import re
from typing import Dict, List, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class DocumentStructure:
    """Analysis of document structure and layout"""
    format_type: str  # 'table', 'sections', 'list', 'mixed'
    platform_organization: str  # 'columns', 'sections', 'mixed', 'single'
    column_headers: List[str]  # Detected column headers
    section_headers: List[str]  # Detected section headers
    platform_indicators: Dict[str, int]  # Platform keywords and counts
    layout_hints: List[str]  # Hints for AI parser
    confidence: float  # Confidence in structure analysis

class DocumentStructureAnalyzer:
    """Analyzes document structure to help AI parsing"""
    
    def __init__(self):
        self.platform_keywords = {
            'windows': ['windows', 'win', 'ctrl', 'alt', 'shift', 'pc'],
            'mac': ['mac', 'macos', 'cmd', 'command', '⌘', '⌥', '⇧', '⌃', 'option'],
            'linux': ['linux', 'unix'],
            'cross_platform': ['cross-platform', 'all platforms', 'universal']
        }
        
        self.table_indicators = [
            'description', 'shortcut', 'key', 'action', 'function',
            'windows & linux', 'mac', 'macos', 'command'
        ]
        
        self.section_indicators = [
            'console', 'editor', 'navigation', 'file', 'edit', 'view',
            'tools', 'help', 'debug', 'source', 'terminal'
        ]
    
    def analyze_structure(self, text: str, filename: str = "") -> DocumentStructure:
        """Analyze document structure and layout"""
        
        # Basic text analysis
        lines = text.split('\n')
        non_empty_lines = [line.strip() for line in lines if line.strip()]
        
        # Detect format type
        format_type = self._detect_format_type(text, lines)
        
        # Detect platform organization
        platform_org = self._detect_platform_organization(text, lines)
        
        # Extract headers
        column_headers = self._extract_column_headers(lines)
        section_headers = self._extract_section_headers(lines)
        
        # Count platform indicators
        platform_indicators = self._count_platform_indicators(text)
        
        # Generate layout hints for AI
        layout_hints = self._generate_layout_hints(
            format_type, platform_org, column_headers, section_headers, platform_indicators
        )
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            format_type, platform_org, column_headers, section_headers, len(non_empty_lines)
        )
        
        return DocumentStructure(
            format_type=format_type,
            platform_organization=platform_org,
            column_headers=column_headers,
            section_headers=section_headers,
            platform_indicators=platform_indicators,
            layout_hints=layout_hints,
            confidence=confidence
        )
    
    def _detect_format_type(self, text: str, lines: List[str]) -> str:
        """Detect if document is table, sections, list, or mixed format"""
        
        # Check for table indicators
        table_score = 0
        for indicator in self.table_indicators:
            if indicator.lower() in text.lower():
                table_score += 1
        
        # Check for consistent column structure
        column_patterns = 0
        for line in lines[:20]:  # Check first 20 lines
            # Look for patterns like "Action | Windows | Mac"
            if '|' in line or '\t' in line:
                column_patterns += 1
            # Look for aligned columns (multiple spaces)
            if re.search(r'\s{3,}', line):
                column_patterns += 1
        
        # Check for section structure
        section_score = 0
        for line in lines[:50]:  # Check first 50 lines
            line_clean = line.strip()
            if line_clean and (line_clean.isupper() or line_clean.endswith(':')):
                section_score += 1
        
        # Determine format type
        if table_score >= 3 or column_patterns >= 5:
            return 'table'
        elif section_score >= 3:
            return 'sections'
        elif table_score > 0 and section_score > 0:
            return 'mixed'
        else:
            return 'list'
    
    def _detect_platform_organization(self, text: str, lines: List[str]) -> str:
        """Detect how platforms are organized in the document"""
        
        text_lower = text.lower()
        
        # Check for column-based organization
        column_indicators = ['windows & linux', 'mac', 'windows', 'macos']
        column_score = sum(1 for indicator in column_indicators if indicator in text_lower)
        
        # Check for section-based organization
        section_patterns = []
        for line in lines[:30]:
            line_clean = line.strip().lower()
            if any(platform in line_clean for platform in ['windows', 'mac', 'linux']):
                if line_clean.endswith(':') or len(line_clean.split()) <= 3:
                    section_patterns.append(line_clean)
        
        # Count platform mentions
        platform_counts = self._count_platform_indicators(text)
        total_platforms = sum(1 for count in platform_counts.values() if count > 0)
        
        if column_score >= 2:
            return 'columns'
        elif len(section_patterns) >= 2:
            return 'sections'
        elif total_platforms >= 2:
            return 'mixed'
        else:
            return 'single'
    
    def _extract_column_headers(self, lines: List[str]) -> List[str]:
        """Extract potential column headers from document"""
        
        print(f"   🔍 Extracting column headers from {len(lines)} lines")
        headers = []
        
        # Look for header-like lines in first 50 lines (increased to catch more)
        for i, line in enumerate(lines[:50]):
            line_clean = line.strip()
            if not line_clean:
                continue
            
            line_lower = line_clean.lower()
            
            # Method 1: Look for vertical header layout (RStudio style) - CHECK FIRST
            # Check for the specific pattern: Description, Windows & Linux, Mac
            if i < len(lines) - 2:
                current_line = line_clean
                next_line = lines[i + 1].strip() if i + 1 < len(lines) else ""
                next_next_line = lines[i + 2].strip() if i + 2 < len(lines) else ""
                
                # Specific check for RStudio pattern
                if (current_line.lower() == 'description' and 
                    'windows' in next_line.lower() and 
                    next_next_line.lower() == 'mac'):
                    
                    print(f"   🎯 Found RStudio header pattern at line {i}")
                    headers = [current_line, next_line, next_next_line]
                    break  # Found the specific pattern we need
                
                # General check for header sequence
                elif (self._is_potential_header(current_line) and 
                      self._is_potential_header(next_line) and 
                      self._is_potential_header(next_next_line)):
                    
                    # Check if this is followed by data rows
                    data_start = i + 3
                    if data_start < len(lines):
                        # Look for shortcut patterns in the following lines
                        has_data = False
                        for j in range(data_start, min(data_start + 10, len(lines))):
                            if self._contains_shortcut_patterns(lines[j]):
                                has_data = True
                                break
                        
                        if has_data:
                            print(f"   🎯 Found general header pattern at line {i}")
                            headers = [current_line, next_line, next_next_line]
                            break  # Found a valid header sequence
            
            # Method 2: Look for lines with table indicators (horizontal headers)
            elif any(indicator in line_lower for indicator in self.table_indicators):
                cols = self._split_line_into_columns(line_clean)
                if len(cols) >= 2:
                    headers.extend([col for col in cols if col])
        
        # If no vertical headers found, try horizontal headers
        if not headers:
            for i, line in enumerate(lines[:30]):
                line_clean = line.strip()
                if not line_clean:
                    continue
                
                line_lower = line_clean.lower()
                
                # Look for lines that appear to be headers based on context
                if i < len(lines) - 2:
                    next_line = lines[i + 1].strip() if i + 1 < len(lines) else ""
                    next_next_line = lines[i + 2].strip() if i + 2 < len(lines) else ""
                    
                    # If current line has platform keywords and next lines have shortcut patterns
                    if (any(platform in line_lower for platform in ['windows', 'mac', 'description']) and
                        (self._contains_shortcut_patterns(next_line) or self._contains_shortcut_patterns(next_next_line))):
                        
                        cols = self._split_line_into_columns(line_clean)
                        if len(cols) >= 2:
                            headers.extend([col for col in cols if col])
        
        # Remove duplicates while preserving order
        seen = set()
        unique_headers = []
        for header in headers:
            if header.lower() not in seen:
                seen.add(header.lower())
                unique_headers.append(header)
        
        return unique_headers[:5]  # Limit to 5 most relevant headers
    
    def _is_potential_header(self, line: str) -> bool:
        """Check if a line looks like a potential column header"""
        
        if not line or len(line) > 50:  # Too long to be a header
            return False
        
        line_lower = line.lower()
        
        # Check for header keywords
        header_keywords = ['description', 'windows', 'mac', 'linux', 'shortcut', 'key', 'action', 'command']
        
        # Must contain header keywords
        if not any(keyword in line_lower for keyword in header_keywords):
            return False
        
        # Should be relatively short (typical header length)
        if len(line.split()) > 4:
            return False
        
        # Should not contain shortcut patterns (headers don't have Ctrl+X etc.)
        if self._contains_shortcut_patterns(line):
            return False
        
        return True
    
    def _split_line_into_columns(self, line: str) -> List[str]:
        """Split a line into potential columns using various methods"""
        
        # Method 1: Split by pipe
        if '|' in line:
            return [col.strip() for col in line.split('|') if col.strip()]
        
        # Method 2: Split by tab
        elif '\t' in line:
            return [col.strip() for col in line.split('\t') if col.strip()]
        
        # Method 3: Split by multiple spaces (3 or more)
        else:
            cols = re.split(r'\s{3,}', line)
            return [col.strip() for col in cols if col.strip()]
    
    def _contains_shortcut_patterns(self, line: str) -> bool:
        """Check if line contains shortcut patterns"""
        
        if not line:
            return False
        
        shortcut_patterns = [
            r'Ctrl\+\w+',
            r'Cmd\+\w+',
            r'Alt\+\w+',
            r'Shift\+\w+',
            r'F\d+',
            r'Home|End|Delete|Insert|Tab|Enter|Esc'
        ]
        
        for pattern in shortcut_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                return True
        
        return False
    
    def _extract_section_headers(self, lines: List[str]) -> List[str]:
        """Extract section headers from document"""
        
        headers = []
        
        for line in lines[:50]:  # Check first 50 lines
            line_clean = line.strip()
            if not line_clean:
                continue
            
            # Check for section header patterns
            is_header = False
            
            # All caps (but not too long)
            if line_clean.isupper() and 3 <= len(line_clean) <= 30:
                is_header = True
            
            # Ends with colon
            elif line_clean.endswith(':') and len(line_clean.split()) <= 5:
                is_header = True
            
            # Contains section keywords
            elif any(keyword in line_clean.lower() for keyword in self.section_indicators):
                if len(line_clean.split()) <= 4:
                    is_header = True
            
            if is_header:
                headers.append(line_clean)
        
        return headers[:10]  # Limit to 10 most relevant headers
    
    def _count_platform_indicators(self, text: str) -> Dict[str, int]:
        """Count platform-specific keywords in text"""
        
        text_lower = text.lower()
        counts = {}
        
        for platform, keywords in self.platform_keywords.items():
            count = sum(text_lower.count(keyword) for keyword in keywords)
            counts[platform] = count
        
        return counts
    
    def _generate_layout_hints(self, format_type: str, platform_org: str, 
                             column_headers: List[str], section_headers: List[str],
                             platform_indicators: Dict[str, int]) -> List[str]:
        """Generate hints for AI parser based on structure analysis"""
        
        hints = []
        
        # Format-specific hints
        if format_type == 'table':
            hints.append("Document uses TABLE FORMAT with columns")
            if column_headers:
                hints.append(f"Column headers detected: {', '.join(column_headers)}")
        elif format_type == 'sections':
            hints.append("Document uses SECTION FORMAT with headers")
            if section_headers:
                hints.append(f"Section headers: {', '.join(section_headers[:3])}")
        elif format_type == 'mixed':
            hints.append("Document uses MIXED FORMAT (tables and sections)")
        
        # Platform organization hints
        if platform_org == 'columns':
            hints.append("Platforms organized in COLUMNS (side-by-side)")
        elif platform_org == 'sections':
            hints.append("Platforms organized in SECTIONS (separate blocks)")
        elif platform_org == 'mixed':
            hints.append("Multiple platforms present - look for both formats")
        
        # Platform-specific hints
        platform_counts = {k: v for k, v in platform_indicators.items() if v > 0}
        if len(platform_counts) >= 2:
            platforms = list(platform_counts.keys())
            hints.append(f"Multiple platforms detected: {', '.join(platforms)}")
        
        # Extraction strategy hints
        if format_type == 'table' and platform_org == 'columns':
            hints.append("STRATEGY: Extract from each row, create separate entries for each platform column")
        elif format_type == 'sections' and platform_org == 'sections':
            hints.append("STRATEGY: Process each platform section separately")
        
        return hints
    
    def _calculate_confidence(self, format_type: str, platform_org: str,
                            column_headers: List[str], section_headers: List[str],
                            line_count: int) -> float:
        """Calculate confidence in structure analysis"""
        
        confidence = 50.0  # Base confidence
        
        # Format detection confidence
        if format_type in ['table', 'sections']:
            confidence += 20.0
        elif format_type == 'mixed':
            confidence += 10.0
        
        # Platform organization confidence
        if platform_org in ['columns', 'sections']:
            confidence += 15.0
        elif platform_org == 'mixed':
            confidence += 10.0
        
        # Header detection confidence
        if column_headers:
            confidence += min(len(column_headers) * 5, 15)
        if section_headers:
            confidence += min(len(section_headers) * 3, 10)
        
        # Document size factor
        if line_count > 50:
            confidence += 5.0
        
        return min(confidence, 95.0)

def main():
    """Test the document structure analyzer"""
    
    analyzer = DocumentStructureAnalyzer()
    
    # Test with RStudio document
    import fitz
    rstudio_file = Path("../source_keyboard_shortcuts/RStudio_Cross-platform_shortcuts.pdf")
    
    if rstudio_file.exists():
        doc = fitz.open(rstudio_file)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        
        print(f"🔍 Analyzing: {rstudio_file.name}")
        structure = analyzer.analyze_structure(text, rstudio_file.name)
        
        print(f"\n📊 Structure Analysis:")
        print(f"   Format Type: {structure.format_type}")
        print(f"   Platform Organization: {structure.platform_organization}")
        print(f"   Confidence: {structure.confidence:.1f}%")
        
        if structure.column_headers:
            print(f"   Column Headers: {structure.column_headers}")
        
        if structure.section_headers:
            print(f"   Section Headers: {structure.section_headers[:3]}")
        
        print(f"   Platform Indicators: {structure.platform_indicators}")
        
        print(f"\n💡 Layout Hints:")
        for hint in structure.layout_hints:
            print(f"      • {hint}")

if __name__ == "__main__":
    main()