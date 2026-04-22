#!/usr/bin/env python3
"""
Python-First Extractor - Uses Python parsing as primary method with AI validation
More reliable and efficient than AI-first approach
"""
import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path
from extraction_engine import ExtractedShortcut

@dataclass
class PythonExtractionResult:
    """Result from Python-based extraction"""
    shortcuts: List[ExtractedShortcut]
    confidence: float
    method: str
    needs_ai_validation: bool
    extraction_notes: List[str]

class PythonFirstExtractor:
    """Primary extractor using Python parsing with AI validation backup"""
    
    def __init__(self):
        # Shortcut patterns for different platforms
        self.shortcut_patterns = {
            'mac_symbols': r'[⌘⌥⇧⌃]\s*\+?\s*\w+',
            'mac_text': r'(Cmd|Command|Option)\s*\+\s*\w+',
            'windows': r'(Ctrl|Alt|Shift|Win)\s*\+\s*\w+',
            'function_keys': r'F\d+',
            'vim_commands': r':\w+',
            'single_keys': r'\b(Home|End|Delete|Insert|Tab|Enter|Esc|Space|Up|Down|Left|Right)\b',
            'arrow_combos': r'(Ctrl|Alt|Shift|Cmd|Command)\s*\+\s*(Up|Down|Left|Right|Home|End)'
        }
        
        # Platform detection keywords
        self.platform_keywords = {
            'windows': ['windows', 'win', 'linux', 'pc', 'ctrl', 'alt'],
            'mac': ['mac', 'macos', 'osx', 'apple', 'cmd', 'command', '⌘', '⌥', '⇧', '⌃']
        }
        
        # Description patterns
        self.description_patterns = [
            r'^([A-Z][a-z\s]+)(?:\s+[A-Z]|$)',  # Capitalized descriptions
            r'^([a-z\s]+)(?:\s+[A-Z]|$)',       # Lowercase descriptions
            r'^(.+?)(?:\s{2,}|\t)',             # Text before multiple spaces/tabs
        ]
    
    def extract_shortcuts(self, text: str, software_name: str, 
                         classification_result) -> PythonExtractionResult:
        """Main extraction method - tries Python first, then AI validation"""
        
        print(f"   🐍 Python-first extraction for {software_name}")
        
        # Analyze document structure
        structure_info = self._analyze_document_structure(text)
        
        # Choose extraction strategy based on structure
        if structure_info['is_table']:
            result = self._extract_from_table(text, software_name, classification_result, structure_info)
        elif structure_info['is_list']:
            result = self._extract_from_list(text, software_name, classification_result)
        else:
            result = self._extract_from_unstructured(text, software_name, classification_result)
        
        print(f"   📊 Python extracted {len(result.shortcuts)} shortcuts (confidence: {result.confidence:.1f}%)")
        
        return result
    
    def _analyze_document_structure(self, text: str) -> Dict:
        """Analyze document structure to choose extraction strategy"""
        
        lines = text.split('\n')
        non_empty_lines = [line.strip() for line in lines if line.strip()]
        
        structure = {
            'is_table': False,
            'is_list': False,
            'table_info': {},
            'total_lines': len(non_empty_lines)
        }
        
        # Check for table structure
        table_indicators = 0
        column_separators = 0
        
        for line in lines[:20]:  # Check first 20 lines
            line_clean = line.strip().lower()
            
            # Look for table headers
            if any(keyword in line_clean for keyword in ['description', 'windows', 'mac', 'shortcut', 'key']):
                table_indicators += 1
            
            # Look for column separators
            if '|' in line or '\t' in line or re.search(r'\s{3,}', line):
                column_separators += 1
        
        if table_indicators >= 2 and column_separators >= 3:
            structure['is_table'] = True
            structure['table_info'] = self._analyze_table_structure(text)
        else:
            structure['is_list'] = True
        
        return structure
    
    def _analyze_table_structure(self, text: str) -> Dict:
        """Analyze table structure in detail"""
        
        lines = text.split('\n')
        
        # Find header line
        header_line = None
        header_index = -1
        
        for i, line in enumerate(lines[:20]):
            line_clean = line.strip().lower()
            if ('description' in line_clean and 
                ('windows' in line_clean or 'mac' in line_clean)):
                header_line = line.strip()
                header_index = i
                break
        
        table_info = {
            'header_line': header_line,
            'header_index': header_index,
            'columns': [],
            'has_cross_platform': False
        }
        
        if header_line:
            # Parse columns
            if '|' in header_line:
                columns = [col.strip() for col in header_line.split('|') if col.strip()]
            elif '\t' in header_line:
                columns = [col.strip() for col in header_line.split('\t') if col.strip()]
            else:
                columns = re.split(r'\s{3,}', header_line)
                columns = [col.strip() for col in columns if col.strip()]
            
            table_info['columns'] = columns
            
            # Check for cross-platform indicators
            column_text = ' '.join(columns).lower()
            if (('windows' in column_text or 'linux' in column_text) and 
                ('mac' in column_text)):
                table_info['has_cross_platform'] = True
        
        return table_info
    
    def _extract_from_table(self, text: str, software_name: str, 
                           classification_result, structure_info: Dict) -> PythonExtractionResult:
        """Extract shortcuts from table format"""
        
        shortcuts = []
        notes = []
        
        table_info = structure_info['table_info']
        
        if not table_info['header_line']:
            notes.append("Could not find table header")
            return PythonExtractionResult(
                shortcuts=[], confidence=0.0, method="table_failed",
                needs_ai_validation=True, extraction_notes=notes
            )
        
        lines = text.split('\n')
        header_index = table_info['header_index']
        columns = table_info['columns']
        
        print(f"   📋 Table columns: {columns}")
        
        # Identify column types
        column_types = []
        for col in columns:
            col_lower = col.lower()
            if 'description' in col_lower or 'action' in col_lower:
                column_types.append('description')
            elif 'windows' in col_lower or 'linux' in col_lower:
                column_types.append('windows')
            elif 'mac' in col_lower:
                column_types.append('mac')
            else:
                column_types.append('unknown')
        
        print(f"   📋 Column types: {column_types}")
        
        # Extract data rows
        data_rows = 0
        for line in lines[header_index + 1:]:
            line_clean = line.strip()
            if not line_clean or self._is_separator_line(line_clean):
                continue
            
            # Parse row
            row_shortcuts = self._parse_table_row(line_clean, columns, column_types, software_name)
            shortcuts.extend(row_shortcuts)
            
            if row_shortcuts:
                data_rows += 1
        
        notes.append(f"Parsed {data_rows} table rows")
        
        confidence = 90.0 if len(shortcuts) > 0 else 20.0
        needs_validation = len(shortcuts) < 10  # Validate if too few shortcuts
        
        return PythonExtractionResult(
            shortcuts=shortcuts, confidence=confidence, method="table_parsing",
            needs_ai_validation=needs_validation, extraction_notes=notes
        )
    
    def _parse_table_row(self, line: str, columns: List[str], column_types: List[str], 
                        software_name: str) -> List[ExtractedShortcut]:
        """Parse a single table row - platform determined by COLUMN, not key pattern"""
        
        shortcuts = []
        
        # Split the line
        if '|' in line:
            cells = [cell.strip() for cell in line.split('|')]
        elif '\t' in line:
            cells = [cell.strip() for cell in line.split('\t')]
        else:
            cells = re.split(r'\s{3,}', line)
            cells = [cell.strip() for cell in cells if cell.strip()]
        
        # Ensure we have enough cells
        while len(cells) < len(column_types):
            cells.append('')
        
        # Extract description and shortcuts
        description = ""
        platform_shortcuts = {}
        
        for i, (cell, col_type) in enumerate(zip(cells, column_types)):
            if col_type == 'description':
                description = cell
            elif col_type in ['windows', 'mac'] and self._looks_like_shortcut(cell):
                # Platform determined by COLUMN HEADER, not key pattern
                platform = 'Windows' if col_type == 'windows' else 'macOS'
                platform_shortcuts[platform] = cell
        
        # Create shortcut objects
        if description and platform_shortcuts:
            for platform, shortcut_key in platform_shortcuts.items():
                shortcut = ExtractedShortcut(
                    software=software_name,
                    platform=platform,  # Platform from column, not key analysis
                    key_combination=shortcut_key,
                    title=description,
                    description=description,
                    category="General",
                    confidence=90.0,  # High confidence - table structure is reliable
                    extraction_method="python_table_parser",
                    source_page=0
                )
                shortcuts.append(shortcut)
        
        return shortcuts
    
    def _extract_from_list(self, text: str, software_name: str, 
                          classification_result) -> PythonExtractionResult:
        """Extract shortcuts from list format"""
        
        shortcuts = []
        notes = ["Using list extraction"]
        
        lines = text.split('\n')
        
        # Create document context
        document_context = {
            'cross_platform': classification_result.platform == 'Cross-platform',
            'software': software_name.lower()
        }
        
        for line in lines:
            line_clean = line.strip()
            if not line_clean:
                continue
            
            # Look for shortcut patterns
            shortcut_matches = self._find_shortcuts_in_line(line_clean, document_context)
            
            if shortcut_matches:
                description = self._extract_description_from_line(line_clean, shortcut_matches)
                
                for shortcut_key, platform in shortcut_matches:
                    shortcut = ExtractedShortcut(
                        software=software_name,
                        platform=platform,
                        key_combination=shortcut_key,
                        title=description,
                        description=description,
                        category="General",
                        confidence=75.0,
                        extraction_method="python_list_parser",
                        source_page=0
                    )
                    shortcuts.append(shortcut)
        
        confidence = 70.0 if len(shortcuts) > 0 else 10.0
        needs_validation = True  # List extraction always needs validation
        
        return PythonExtractionResult(
            shortcuts=shortcuts, confidence=confidence, method="list_parsing",
            needs_ai_validation=needs_validation, extraction_notes=notes
        )
    
    def _extract_from_unstructured(self, text: str, software_name: str, 
                                  classification_result) -> PythonExtractionResult:
        """Extract from unstructured text - minimal extraction"""
        
        shortcuts = []
        notes = ["Unstructured text - minimal extraction"]
        
        # Create document context
        document_context = {
            'cross_platform': classification_result.platform == 'Cross-platform',
            'software': software_name.lower()
        }
        
        # Only extract very obvious shortcuts
        for pattern_name, pattern in self.shortcut_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            
            for match in matches[:5]:  # Limit to 5 per pattern
                platform = self._determine_platform_from_shortcut(match, document_context)
                
                shortcut = ExtractedShortcut(
                    software=software_name,
                    platform=platform,
                    key_combination=match,
                    title=f"Shortcut ({pattern_name})",
                    description=f"Extracted {pattern_name} shortcut",
                    category="General",
                    confidence=50.0,
                    extraction_method="python_pattern_match",
                    source_page=0
                )
                shortcuts.append(shortcut)
        
        confidence = 30.0 if len(shortcuts) > 0 else 0.0
        
        return PythonExtractionResult(
            shortcuts=shortcuts, confidence=confidence, method="unstructured_parsing",
            needs_ai_validation=True, extraction_notes=notes
        )
    
    def _find_shortcuts_in_line(self, line: str, document_context=None) -> List[Tuple[str, str]]:
        """Find shortcuts in a line and determine their platforms"""
        
        shortcuts = []
        
        for pattern_name, pattern in self.shortcut_patterns.items():
            matches = re.findall(pattern, line, re.IGNORECASE)
            
            for match in matches:
                # Handle tuple matches from regex groups
                if isinstance(match, tuple):
                    match = ''.join(match)  # Join tuple elements
                
                platform = self._determine_platform_from_shortcut(match, document_context)
                shortcuts.append((match, platform))
        
        return shortcuts
    
    def _determine_platform_from_shortcut(self, shortcut: str, document_context=None) -> str:
        """Determine platform from shortcut key combination - CONTEXT DEPENDENT"""
        
        shortcut_lower = shortcut.lower()
        
        # STRONG Mac indicators (Mac-specific symbols/keys)
        if any(indicator in shortcut for indicator in ['⌘', '⌥', '⇧', '⌃']):
            return 'macOS'
        
        if any(indicator in shortcut_lower for indicator in ['cmd', 'command', 'option']):
            return 'macOS'
        
        # STRONG Windows indicators
        if any(indicator in shortcut_lower for indicator in ['win', 'windows']):
            return 'Windows'
        
        # AMBIGUOUS indicators - Ctrl and Alt are used on BOTH platforms
        # Use document context if available
        if document_context and 'cross_platform' in document_context:
            # For cross-platform documents, assume Ctrl/Alt without Mac symbols are Windows
            if any(indicator in shortcut_lower for indicator in ['ctrl', 'alt', 'shift']):
                return 'Windows'
        
        # Default to 'Unknown' - let context determine platform
        return 'Unknown'
    
    def _extract_description_from_line(self, line: str, shortcuts: List[Tuple[str, str]]) -> str:
        """Extract description from line containing shortcuts"""
        
        # Remove shortcuts from line
        cleaned_line = line
        for shortcut_key, _ in shortcuts:
            cleaned_line = cleaned_line.replace(shortcut_key, '')
        
        # Clean up and extract meaningful description
        cleaned_line = re.sub(r'\s+', ' ', cleaned_line).strip()
        cleaned_line = re.sub(r'^[-•\*\d\.\)]+\s*', '', cleaned_line)  # Remove bullets/numbers
        
        # Take first meaningful part
        words = cleaned_line.split()
        if words:
            return ' '.join(words[:6])  # First 6 words
        
        return "Action"
    
    def _looks_like_shortcut(self, text: str) -> bool:
        """Check if text looks like a keyboard shortcut"""
        
        if not text or len(text) > 30:
            return False
        
        # Check against patterns
        for pattern in self.shortcut_patterns.values():
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def _is_separator_line(self, line: str) -> bool:
        """Check if line is a separator"""
        
        # Lines with mostly dashes, equals, or underscores
        if re.match(r'^[-=_\s|]+$', line):
            return True
        
        return False

def main():
    """Test the Python-first extractor"""
    
    extractor = PythonFirstExtractor()
    
    # Test with RStudio content
    test_text = """
    Console
    Description     Windows & Linux    Mac
    Move cursor to Console   Ctrl+2    Ctrl+2
    Clear console   Ctrl+L    Cmd+L
    Move cursor to beginning of line   Home    Cmd+Left
    Move cursor to end of line   End    Cmd+Right
    Navigate command history   Up/Down    Up/Down
    """
    
    print("🧪 Testing Python-First Extractor")
    
    # Mock classification result
    class MockClassification:
        def __init__(self):
            self.software_name = "RStudio"
            self.platform = "Cross-platform"
    
    classification = MockClassification()
    
    result = extractor.extract_shortcuts(test_text, "RStudio", classification)
    
    print(f"\n📊 Results:")
    print(f"   Method: {result.method}")
    print(f"   Confidence: {result.confidence:.1f}%")
    print(f"   Needs AI validation: {result.needs_ai_validation}")
    print(f"   Notes: {result.extraction_notes}")
    print(f"   Shortcuts: {len(result.shortcuts)}")
    
    for shortcut in result.shortcuts:
        print(f"      {shortcut.platform}: {shortcut.key_combination} → {shortcut.title}")

if __name__ == "__main__":
    main()