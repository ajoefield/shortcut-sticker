#!/usr/bin/env python3
"""
Table Parser - Direct Python parsing for table-format shortcut documents
More reliable than AI for structured table documents like RStudio
"""
import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path
from extraction_engine import ExtractedShortcut

@dataclass
class TableColumn:
    """Represents a column in a shortcut table"""
    header: str
    platform: str  # 'Windows', 'macOS', 'Description', etc.
    index: int
    
@dataclass
class TableRow:
    """Represents a row in a shortcut table"""
    description: str
    shortcuts: Dict[str, str]  # platform -> shortcut
    confidence: float

class TableParser:
    """Parses table-format shortcut documents directly with Python"""
    
    def __init__(self):
        self.platform_mappings = {
            'windows & linux': 'Windows',
            'windows': 'Windows',
            'win': 'Windows',
            'linux': 'Windows',  # Treat Linux as Windows for shortcuts
            'pc': 'Windows',
            'mac': 'macOS',
            'macos': 'macOS',
            'osx': 'macOS',
            'apple': 'macOS'
        }
        
        self.description_keywords = [
            'description', 'action', 'function', 'command', 'task'
        ]
        
        # Common shortcut patterns
        self.shortcut_patterns = [
            r'[⌘⌥⇧⌃]\+?\w+',  # Mac symbols
            r'(Ctrl|Alt|Shift|Cmd|Command|Option|Win)\+\w+',  # Text modifiers
            r'F\d+',  # Function keys
            r'[A-Z]\+[A-Z]',  # Key combinations
            r':\w+',  # Vim commands
            r'Home|End|Delete|Insert|Tab|Enter|Esc|Space'  # Special keys
        ]
    
    def can_parse_table(self, text: str, structure_analysis) -> bool:
        """Check if this document can be parsed as a table"""
        
        if not structure_analysis:
            return False
        
        # Must be table format with columns
        if structure_analysis.format_type != 'table':
            return False
        
        if structure_analysis.platform_organization != 'columns':
            return False
        
        # Must have platform indicators in column headers
        if not structure_analysis.column_headers:
            return False
        
        # Check if we can identify platform columns
        platform_columns = self._identify_platform_columns(structure_analysis.column_headers)
        
        return len(platform_columns) >= 2  # Need at least 2 platform columns
    
    def parse_table_shortcuts(self, text: str, software_name: str, 
                            structure_analysis) -> List[ExtractedShortcut]:
        """Parse shortcuts directly from table structure"""
        
        print(f"   📊 Using direct table parser for {software_name}")
        
        # Split into lines and find table structure
        lines = text.split('\n')
        
        # Find column headers
        header_line, header_index = self._find_header_line(lines)
        if not header_line:
            print(f"   ❌ Could not find table headers")
            return []
        
        # Parse column structure
        columns = self._parse_columns(header_line)
        if not columns:
            print(f"   ❌ Could not parse table columns")
            return []
        
        print(f"   📋 Found {len(columns)} columns: {[col.header for col in columns]}")
        
        # Parse data rows
        data_rows = self._parse_data_rows(lines[header_index + 1:], columns)
        
        print(f"   📊 Parsed {len(data_rows)} table rows")
        
        # Convert to shortcuts
        shortcuts = self._convert_rows_to_shortcuts(data_rows, software_name)
        
        print(f"   ✅ Extracted {len(shortcuts)} shortcuts from table")
        
        return shortcuts
    
    def _find_header_line(self, lines: List[str]) -> Tuple[Optional[str], int]:
        """Find the line containing column headers"""
        
        for i, line in enumerate(lines[:20]):  # Check first 20 lines
            line_clean = line.strip()
            if not line_clean:
                continue
            
            line_lower = line_clean.lower()
            
            # Look for platform keywords
            platform_count = sum(1 for platform in self.platform_mappings.keys() 
                                if platform in line_lower)
            
            # Look for description keywords
            desc_count = sum(1 for keyword in self.description_keywords 
                           if keyword in line_lower)
            
            # Must have both platform and description indicators
            if platform_count >= 1 and desc_count >= 1:
                return line_clean, i
            
            # Alternative: look for lines with multiple columns
            if self._looks_like_header(line_clean):
                return line_clean, i
        
        return None, -1
    
    def _looks_like_header(self, line: str) -> bool:
        """Check if line looks like a table header"""
        
        # Check for column separators
        separators = ['|', '\t']
        for sep in separators:
            if sep in line and len(line.split(sep)) >= 3:
                return True
        
        # Check for multiple words that could be column headers
        words = line.split()
        if len(words) >= 3:
            # Check if words contain platform or description keywords
            line_lower = line.lower()
            keyword_count = 0
            
            for word in words:
                word_lower = word.lower()
                if (word_lower in self.platform_mappings or 
                    word_lower in self.description_keywords or
                    word_lower in ['shortcut', 'key', 'combination']):
                    keyword_count += 1
            
            return keyword_count >= 2
        
        return False
    
    def _parse_columns(self, header_line: str) -> List[TableColumn]:
        """Parse column structure from header line"""
        
        columns = []
        
        # Try different splitting methods
        column_texts = []
        
        # Method 1: Split by pipe
        if '|' in header_line:
            column_texts = [col.strip() for col in header_line.split('|') if col.strip()]
        
        # Method 2: Split by tab
        elif '\t' in header_line:
            column_texts = [col.strip() for col in header_line.split('\t') if col.strip()]
        
        # Method 3: Split by multiple spaces
        else:
            column_texts = re.split(r'\s{3,}', header_line)
            column_texts = [col.strip() for col in column_texts if col.strip()]
        
        # Identify column types
        for i, col_text in enumerate(column_texts):
            col_lower = col_text.lower()
            
            # Determine platform
            platform = 'Description'  # Default
            
            for platform_key, platform_name in self.platform_mappings.items():
                if platform_key in col_lower:
                    platform = platform_name
                    break
            
            # Check for description column
            if any(keyword in col_lower for keyword in self.description_keywords):
                platform = 'Description'
            
            columns.append(TableColumn(
                header=col_text,
                platform=platform,
                index=i
            ))
        
        return columns
    
    def _parse_data_rows(self, lines: List[str], columns: List[TableColumn]) -> List[TableRow]:
        """Parse data rows from table"""
        
        rows = []
        
        for line in lines:
            line_clean = line.strip()
            if not line_clean:
                continue
            
            # Skip lines that look like headers or separators
            if self._is_separator_line(line_clean):
                continue
            
            # Parse row data
            row_data = self._parse_row_data(line_clean, columns)
            if row_data:
                rows.append(row_data)
        
        return rows
    
    def _is_separator_line(self, line: str) -> bool:
        """Check if line is a separator (dashes, equals, etc.)"""
        
        # Lines with mostly dashes, equals, or underscores
        if re.match(r'^[-=_\s|]+$', line):
            return True
        
        # Lines that repeat the header
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in ['description', 'windows', 'mac']):
            # But also check if it has actual shortcut content
            if not any(re.search(pattern, line) for pattern in self.shortcut_patterns):
                return True
        
        return False
    
    def _parse_row_data(self, line: str, columns: List[TableColumn]) -> Optional[TableRow]:
        """Parse a single data row"""
        
        # Split the line using same method as headers
        if '|' in line:
            cells = [cell.strip() for cell in line.split('|')]
        elif '\t' in line:
            cells = [cell.strip() for cell in line.split('\t')]
        else:
            cells = re.split(r'\s{3,}', line)
            cells = [cell.strip() for cell in cells if cell.strip()]
        
        # Must have enough cells
        if len(cells) < len(columns):
            # Try to pad with empty cells
            cells.extend([''] * (len(columns) - len(cells)))
        
        # Extract data
        description = ""
        shortcuts = {}
        
        for i, column in enumerate(columns):
            if i >= len(cells):
                continue
            
            cell_content = cells[i]
            
            if column.platform == 'Description':
                description = cell_content
            elif column.platform in ['Windows', 'macOS']:
                # Check if cell contains a shortcut
                if self._looks_like_shortcut(cell_content):
                    shortcuts[column.platform] = cell_content
        
        # Must have description and at least one shortcut
        if description and shortcuts:
            return TableRow(
                description=description,
                shortcuts=shortcuts,
                confidence=90.0  # High confidence for table parsing
            )
        
        return None
    
    def _looks_like_shortcut(self, text: str) -> bool:
        """Check if text looks like a keyboard shortcut"""
        
        if not text or len(text) > 50:  # Too long to be a shortcut
            return False
        
        # Check against shortcut patterns
        for pattern in self.shortcut_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        # Check for simple key names
        simple_keys = ['home', 'end', 'delete', 'insert', 'tab', 'enter', 'esc', 'space', 'up', 'down', 'left', 'right']
        if text.lower() in simple_keys:
            return True
        
        return False
    
    def _convert_rows_to_shortcuts(self, rows: List[TableRow], software_name: str) -> List[ExtractedShortcut]:
        """Convert table rows to ExtractedShortcut objects"""
        
        shortcuts = []
        
        for row in rows:
            for platform, shortcut_key in row.shortcuts.items():
                shortcut = ExtractedShortcut(
                    software=software_name,
                    platform=platform,
                    key_combination=shortcut_key,
                    title=row.description,
                    description=row.description,
                    category="General",
                    confidence=row.confidence,
                    extraction_method="table_parser",
                    source_page=0
                )
                shortcuts.append(shortcut)
        
        return shortcuts
    
    def _identify_platform_columns(self, headers: List[str]) -> Dict[str, str]:
        """Identify which headers correspond to which platforms"""
        
        platform_columns = {}
        
        for header in headers:
            header_lower = header.lower()
            
            for platform_key, platform_name in self.platform_mappings.items():
                if platform_key in header_lower:
                    platform_columns[header] = platform_name
                    break
        
        return platform_columns

def main():
    """Test the table parser"""
    
    parser = TableParser()
    
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
    
    # Mock structure analysis
    from document_structure_analyzer import DocumentStructure
    structure = DocumentStructure(
        format_type='table',
        platform_organization='columns',
        column_headers=['Description', 'Windows & Linux', 'Mac'],
        section_headers=[],
        platform_indicators={'windows': 5, 'mac': 3},
        layout_hints=[],
        confidence=95.0
    )
    
    print("🧪 Testing Table Parser")
    
    if parser.can_parse_table(test_text, structure):
        shortcuts = parser.parse_table_shortcuts(test_text, "RStudio", structure)
        
        print(f"\n📊 Results: {len(shortcuts)} shortcuts")
        for shortcut in shortcuts:
            print(f"   {shortcut.platform}: {shortcut.key_combination} → {shortcut.title}")
    else:
        print("❌ Cannot parse as table")

if __name__ == "__main__":
    main()