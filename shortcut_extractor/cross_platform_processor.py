#!/usr/bin/env python3
"""
Cross-Platform Processor - Post-processes extracted shortcuts from cross-platform documents
to ensure proper Mac/Windows splitting when AI fails to do it correctly
"""
import re
from typing import List, Dict, Tuple
from dataclasses import replace
from extraction_engine import ExtractedShortcut

class CrossPlatformProcessor:
    """Handles cross-platform document processing when AI extraction fails"""
    
    def __init__(self):
        # Mac key patterns
        self.mac_patterns = [
            r'⌘', r'⌥', r'⇧', r'⌃',  # Mac symbols
            r'\bcmd\b', r'\bcommand\b', r'\boption\b',  # Mac text
        ]
        
        # Windows key patterns  
        self.windows_patterns = [
            r'\bctrl\b', r'\balt\b', r'\bshift\b', r'\bwin\b'  # Windows text
        ]
        
        # Common cross-platform shortcuts that should exist in both formats
        self.common_shortcuts = {
            'copy': {'mac': '⌘+C', 'windows': 'Ctrl+C'},
            'paste': {'mac': '⌘+V', 'windows': 'Ctrl+V'},
            'cut': {'mac': '⌘+X', 'windows': 'Ctrl+X'},
            'save': {'mac': '⌘+S', 'windows': 'Ctrl+S'},
            'undo': {'mac': '⌘+Z', 'windows': 'Ctrl+Z'},
            'redo': {'mac': '⌘+Y', 'windows': 'Ctrl+Y'},
            'select all': {'mac': '⌘+A', 'windows': 'Ctrl+A'},
            'find': {'mac': '⌘+F', 'windows': 'Ctrl+F'},
        }
    
    def process_cross_platform_shortcuts(self, shortcuts: List[ExtractedShortcut], 
                                       source_text: str) -> List[ExtractedShortcut]:
        """Process shortcuts from cross-platform documents"""
        
        if not shortcuts:
            return shortcuts
        
        # Check if we have mixed platforms already
        platforms = set(shortcut.platform for shortcut in shortcuts)
        if len(platforms) > 1 and 'Windows' in platforms and 'macOS' in platforms:
            print(f"   ✅ Already has mixed platforms: {platforms}")
            return shortcuts
        
        # If all shortcuts are single platform, try to create cross-platform pairs
        if len(platforms) == 1:
            single_platform = list(platforms)[0]
            print(f"   🔄 All shortcuts are {single_platform}, attempting cross-platform expansion...")
            
            expanded_shortcuts = self._expand_to_cross_platform(shortcuts, source_text)
            if len(expanded_shortcuts) > len(shortcuts):
                print(f"   ✨ Expanded {len(shortcuts)} → {len(expanded_shortcuts)} cross-platform shortcuts")
                return expanded_shortcuts
        
        return shortcuts
    
    def _expand_to_cross_platform(self, shortcuts: List[ExtractedShortcut], 
                                source_text: str) -> List[ExtractedShortcut]:
        """Expand single-platform shortcuts to cross-platform pairs"""
        
        expanded = []
        
        # Analyze source text for platform patterns
        text_analysis = self._analyze_source_text(source_text)
        
        for shortcut in shortcuts:
            # Determine if this shortcut should have cross-platform variants
            variants = self._create_platform_variants(shortcut, text_analysis)
            expanded.extend(variants)
        
        return expanded
    
    def _analyze_source_text(self, text: str) -> Dict:
        """Analyze source text for platform-specific patterns"""
        
        # Look for table-like structures with platform columns
        lines = text.split('\n')
        
        analysis = {
            'has_mac_column': False,
            'has_windows_column': False,
            'table_structure': False,
            'platform_pairs': []
        }
        
        # Check for column headers
        for line in lines[:20]:  # Check first 20 lines
            line_lower = line.lower()
            if 'mac' in line_lower and ('windows' in line_lower or 'linux' in line_lower):
                analysis['table_structure'] = True
                analysis['has_mac_column'] = True
                analysis['has_windows_column'] = True
                break
        
        # Look for paired shortcuts in the text
        if analysis['table_structure']:
            analysis['platform_pairs'] = self._extract_platform_pairs(text)
        
        return analysis
    
    def _extract_platform_pairs(self, text: str) -> List[Dict]:
        """Extract platform-specific shortcut pairs from table text"""
        
        pairs = []
        lines = text.split('\n')
        
        for line in lines:
            # Look for lines with both Mac and Windows shortcuts
            if self._has_mac_pattern(line) and self._has_windows_pattern(line):
                # Try to extract the pairs
                mac_shortcuts = self._extract_mac_shortcuts(line)
                windows_shortcuts = self._extract_windows_shortcuts(line)
                
                if mac_shortcuts and windows_shortcuts:
                    # Try to match them up
                    for i, (mac_key, win_key) in enumerate(zip(mac_shortcuts, windows_shortcuts)):
                        pairs.append({
                            'mac': mac_key,
                            'windows': win_key,
                            'description': self._extract_description(line)
                        })
        
        return pairs
    
    def _has_mac_pattern(self, text: str) -> bool:
        """Check if text contains Mac key patterns"""
        for pattern in self.mac_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def _has_windows_pattern(self, text: str) -> bool:
        """Check if text contains Windows key patterns"""
        for pattern in self.windows_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def _extract_mac_shortcuts(self, line: str) -> List[str]:
        """Extract Mac shortcuts from a line"""
        shortcuts = []
        
        # Look for Mac symbol patterns
        mac_patterns = [
            r'⌘\+[A-Za-z0-9]+',
            r'⌥\+[A-Za-z0-9]+', 
            r'⇧\+[A-Za-z0-9]+',
            r'⌃\+[A-Za-z0-9]+',
            r'Cmd\+[A-Za-z0-9]+',
            r'Command\+[A-Za-z0-9]+',
            r'Option\+[A-Za-z0-9]+'
        ]
        
        for pattern in mac_patterns:
            matches = re.findall(pattern, line, re.IGNORECASE)
            shortcuts.extend(matches)
        
        return shortcuts
    
    def _extract_windows_shortcuts(self, line: str) -> List[str]:
        """Extract Windows shortcuts from a line"""
        shortcuts = []
        
        # Look for Windows patterns
        windows_patterns = [
            r'Ctrl\+[A-Za-z0-9]+',
            r'Alt\+[A-Za-z0-9]+',
            r'Shift\+[A-Za-z0-9]+',
            r'Win\+[A-Za-z0-9]+'
        ]
        
        for pattern in windows_patterns:
            matches = re.findall(pattern, line, re.IGNORECASE)
            shortcuts.extend(matches)
        
        return shortcuts
    
    def _extract_description(self, line: str) -> str:
        """Extract description from a table line"""
        # Remove shortcuts and clean up
        cleaned = re.sub(r'[⌘⌥⇧⌃]', '', line)
        cleaned = re.sub(r'\b(Ctrl|Alt|Shift|Cmd|Command|Option)\+\w+', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        # Take the first meaningful part
        parts = cleaned.split()
        if parts:
            return ' '.join(parts[:5])  # First 5 words
        
        return "Action"
    
    def _create_platform_variants(self, shortcut: ExtractedShortcut, 
                                text_analysis: Dict) -> List[ExtractedShortcut]:
        """Create platform variants for a shortcut"""
        
        variants = [shortcut]  # Always include original
        
        # If we have table structure, try to create the opposite platform
        if text_analysis['table_structure']:
            opposite_variant = self._create_opposite_platform_shortcut(shortcut)
            if opposite_variant:
                variants.append(opposite_variant)
        
        return variants
    
    def _create_opposite_platform_shortcut(self, shortcut: ExtractedShortcut) -> ExtractedShortcut:
        """Create the opposite platform version of a shortcut"""
        
        key_combo = shortcut.key_combination
        
        # Convert Windows to Mac
        if shortcut.platform == 'Windows':
            mac_key = self._convert_windows_to_mac(key_combo)
            if mac_key and mac_key != key_combo:
                return replace(shortcut, 
                             platform='macOS',
                             key_combination=mac_key)
        
        # Convert Mac to Windows  
        elif shortcut.platform == 'macOS':
            windows_key = self._convert_mac_to_windows(key_combo)
            if windows_key and windows_key != key_combo:
                return replace(shortcut,
                             platform='Windows', 
                             key_combination=windows_key)
        
        return None
    
    def _convert_windows_to_mac(self, key_combo: str) -> str:
        """Convert Windows key combination to Mac equivalent"""
        
        # Common conversions
        conversions = {
            'Ctrl': '⌘',
            'Alt': '⌥',
            'Shift': '⇧',
            'Win': '⌘'
        }
        
        mac_key = key_combo
        for win_key, mac_symbol in conversions.items():
            mac_key = re.sub(rf'\b{win_key}\b', mac_symbol, mac_key, flags=re.IGNORECASE)
        
        # Clean up formatting
        mac_key = re.sub(r'\+', ' + ', mac_key)
        mac_key = re.sub(r'\s+', ' ', mac_key).strip()
        
        return mac_key if mac_key != key_combo else None
    
    def _convert_mac_to_windows(self, key_combo: str) -> str:
        """Convert Mac key combination to Windows equivalent"""
        
        # Common conversions
        conversions = {
            '⌘': 'Ctrl',
            '⌥': 'Alt', 
            '⇧': 'Shift',
            '⌃': 'Ctrl'
        }
        
        windows_key = key_combo
        for mac_symbol, win_key in conversions.items():
            windows_key = windows_key.replace(mac_symbol, win_key)
        
        # Also handle text versions
        text_conversions = {
            'Cmd': 'Ctrl',
            'Command': 'Ctrl',
            'Option': 'Alt'
        }
        
        for mac_text, win_text in text_conversions.items():
            windows_key = re.sub(rf'\b{mac_text}\b', win_text, windows_key, flags=re.IGNORECASE)
        
        # Clean up formatting
        windows_key = re.sub(r'\s*\+\s*', '+', windows_key)
        
        return windows_key if windows_key != key_combo else None

def main():
    """Test the cross-platform processor"""
    
    processor = CrossPlatformProcessor()
    
    # Test with sample shortcuts
    test_shortcuts = [
        ExtractedShortcut(
            software="RStudio",
            platform="Windows",
            key_combination="Ctrl+L",
            title="Clear console",
            description="Clear console",
            category="General",
            confidence=100.0,
            extraction_method="simple_ai_claude"
        ),
        ExtractedShortcut(
            software="RStudio", 
            platform="Windows",
            key_combination="Ctrl+2",
            title="Move cursor to Console",
            description="Move cursor to Console",
            category="General",
            confidence=100.0,
            extraction_method="simple_ai_claude"
        )
    ]
    
    # Sample source text with table structure
    source_text = """
    Console
    Description     Windows & Linux    Mac
    Clear console   Ctrl+L            Cmd+L
    Move cursor     Ctrl+2            Ctrl+2
    """
    
    print("🧪 Testing Cross-Platform Processor")
    print(f"Input: {len(test_shortcuts)} Windows shortcuts")
    
    result = processor.process_cross_platform_shortcuts(test_shortcuts, source_text)
    
    print(f"Output: {len(result)} total shortcuts")
    for shortcut in result:
        print(f"   {shortcut.platform}: {shortcut.key_combination} → {shortcut.title}")

if __name__ == "__main__":
    main()