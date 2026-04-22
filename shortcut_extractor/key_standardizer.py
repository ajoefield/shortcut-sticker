#!/usr/bin/env python3
"""
Key Combination Standardizer - Converts shortcuts to consistent, beautiful formats
- Mac: Uses symbols (⌘⌥⇧⌃) with proper spacing
- Windows/Linux: Uses consistent text format (Ctrl+Alt+Shift)
- Cross-platform: Provides both formats
"""
import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from extraction_engine import ExtractedShortcut

@dataclass
class StandardizedShortcut:
    original: ExtractedShortcut
    standardized_key: str
    display_format: str  # 'mac_symbols', 'windows_text', 'cross_platform'
    alternative_formats: Dict[str, str]  # Other platform formats

class KeyStandardizer:
    def __init__(self):
        # Mac symbol mappings
        self.mac_symbols = {
            'cmd': '⌘',
            'command': '⌘',
            'ctrl': '⌃',
            'control': '⌃',
            'alt': '⌥',
            'option': '⌥',
            'shift': '⇧'
        }
        
        # Reverse mapping for converting symbols back to text
        self.symbol_to_text = {
            '⌘': 'Cmd',
            '⌃': 'Ctrl',
            '⌥': 'Alt',
            '⇧': 'Shift'
        }
        
        # Special key mappings
        self.special_keys = {
            'return': '↩',
            'enter': '↩',
            'tab': '⇥',
            'space': '␣',
            'delete': '⌫',
            'backspace': '⌫',
            'escape': '⎋',
            'esc': '⎋',
            'up': '↑',
            'down': '↓',
            'left': '←',
            'right': '→',
            'home': '↖',
            'end': '↘',
            'pageup': '⇞',
            'pagedown': '⇟'
        }
        
        # Windows/Linux standard format
        self.windows_modifiers = ['Ctrl', 'Alt', 'Shift', 'Win']
    
    def standardize_shortcut(self, shortcut: ExtractedShortcut) -> StandardizedShortcut:
        """Standardize a shortcut based on its platform"""
        
        platform = shortcut.platform.lower()
        original_key = shortcut.key_combination.strip()
        
        # Determine target format based on platform
        if 'mac' in platform or platform == 'macos':
            # For Mac shortcuts, preserve original format - don't convert
            standardized_key = original_key
            display_format = 'mac_original'
        elif 'windows' in platform or 'linux' in platform:
            standardized_key = self._convert_to_windows_format(original_key)
            display_format = 'windows_text'
        elif platform == 'osa':
            # OSA (Operating System Agnostic) - keep original format, don't convert
            standardized_key = original_key
            display_format = 'osa_original'
        else:
            # Cross-platform: preserve original format to avoid corruption
            standardized_key = original_key
            display_format = 'cross_platform_original'
        
        # Generate alternative formats (but don't use them for standardized_key)
        alternatives = self._generate_alternative_formats(original_key)
        
        return StandardizedShortcut(
            original=shortcut,
            standardized_key=standardized_key,
            display_format=display_format,
            alternative_formats=alternatives
        )
    
    def _convert_to_mac_symbols(self, key_combination: str) -> str:
        """Convert key combination to Mac symbols format"""
        
        # Handle already converted symbols
        if any(symbol in key_combination for symbol in self.mac_symbols.values()):
            return self._clean_mac_format(key_combination)
        
        # Normalize the input
        key = key_combination.lower().strip()
        
        # Handle special cases first
        if key.startswith(':'):
            return key  # Vim commands stay as-is
        
        if key.startswith('docker '):
            return key  # Docker commands stay as-is
        
        if re.match(r'^[hjklwbegdypcvnmftrxz]{1,3}$', key):
            return key  # Single keys stay as-is
        
        # Split by common separators (+ and -)
        # Handle both "Command+X" and "Command-X" formats
        if '+' in key:
            parts = key.split('+')
        elif '-' in key:
            parts = key.split('-')
        else:
            parts = [key]
        
        converted_parts = []
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
            
            # Convert modifiers to symbols
            if part in self.mac_symbols:
                converted_parts.append(self.mac_symbols[part])
            # Convert special keys to symbols
            elif part in self.special_keys:
                converted_parts.append(self.special_keys[part])
            # Handle function keys
            elif re.match(r'^f\d+$', part):
                converted_parts.append(part.upper())
            # Regular keys stay as-is but capitalize
            else:
                converted_parts.append(part.upper() if len(part) == 1 else part.title())
        
        # Join with proper Mac spacing
        if len(converted_parts) > 1:
            return ' + '.join(converted_parts)
        else:
            return converted_parts[0] if converted_parts else key_combination
    
    def _convert_to_windows_format(self, key_combination: str) -> str:
        """Convert key combination to Windows text format"""
        
        # Convert symbols back to text if present
        key = key_combination
        for symbol, text in self.symbol_to_text.items():
            key = key.replace(symbol, text)
        
        # Normalize the input
        key = key.lower().strip()
        
        # Handle special cases
        if key.startswith(':'):
            return key_combination  # Vim commands stay as-is
        
        if key.startswith('docker '):
            return key_combination  # Docker commands stay as-is
        
        if re.match(r'^[hjklwbegdypcvnmftrxz]{1,3}$', key):
            return key_combination  # Single keys stay as-is
        
        # Split and normalize (+ and -)
        # Handle both "Ctrl+X" and "Ctrl-X" formats  
        if '+' in key:
            parts = key.split('+')
        elif '-' in key:
            parts = key.split('-')
        else:
            parts = [key]
        
        converted_parts = []
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
            
            # Standardize modifier names
            if part in ['cmd', 'command']:
                converted_parts.append('Ctrl')  # Map Cmd to Ctrl for Windows
            elif part in ['ctrl', 'control']:
                converted_parts.append('Ctrl')
            elif part in ['alt', 'option']:
                converted_parts.append('Alt')
            elif part == 'shift':
                converted_parts.append('Shift')
            elif part in ['win', 'windows']:
                converted_parts.append('Win')
            # Handle function keys
            elif re.match(r'^f\d+$', part):
                converted_parts.append(part.upper())
            # Regular keys
            else:
                converted_parts.append(part.upper() if len(part) == 1 else part.title())
        
        # Join with + (no spaces for Windows format)
        return '+'.join(converted_parts) if len(converted_parts) > 1 else (converted_parts[0] if converted_parts else key_combination)
    
    def _clean_mac_format(self, key_combination: str) -> str:
        """Clean up existing Mac symbol format"""
        
        # Normalize spacing around symbols and +
        key = key_combination
        
        # Add spaces around + if not present
        key = re.sub(r'([⌘⌥⇧⌃])\+', r'\1 + ', key)
        key = re.sub(r'\+([⌘⌥⇧⌃A-Z])', r' + \1', key)
        
        # Clean up multiple spaces
        key = re.sub(r'\s+', ' ', key)
        
        return key.strip()
    
    def _generate_alternative_formats(self, original_key: str) -> Dict[str, str]:
        """Generate alternative format representations"""
        
        alternatives = {}
        
        # Generate Mac symbols version
        alternatives['mac_symbols'] = self._convert_to_mac_symbols(original_key)
        
        # Generate Windows text version
        alternatives['windows_text'] = self._convert_to_windows_format(original_key)
        
        # Generate compact version (no spaces)
        compact = alternatives['windows_text'].replace(' + ', '+').replace(' ', '')
        alternatives['compact'] = compact
        
        # Generate verbose version
        verbose = alternatives['windows_text'].replace('+', ' + ')
        alternatives['verbose'] = verbose
        
        return alternatives
    
    def standardize_shortcuts_batch(self, shortcuts: List[ExtractedShortcut]) -> List[StandardizedShortcut]:
        """Standardize a batch of shortcuts"""
        
        print(f"🔧 Standardizing {len(shortcuts)} key combinations...")
        
        standardized = []
        
        for shortcut in shortcuts:
            try:
                std_shortcut = self.standardize_shortcut(shortcut)
                standardized.append(std_shortcut)
            except Exception as e:
                print(f"   ⚠️  Failed to standardize '{shortcut.key_combination}': {e}")
                # Create a fallback standardized shortcut
                standardized.append(StandardizedShortcut(
                    original=shortcut,
                    standardized_key=shortcut.key_combination,
                    display_format='original',
                    alternative_formats={}
                ))
        
        # Show statistics
        mac_count = sum(1 for s in standardized if s.display_format == 'mac_original')
        windows_count = sum(1 for s in standardized if s.display_format == 'windows_text')
        cross_count = sum(1 for s in standardized if s.display_format == 'cross_platform_original')
        osa_count = sum(1 for s in standardized if s.display_format == 'osa_original')
        
        print(f"   ✅ Standardized: {mac_count} Mac original, {windows_count} Windows text, {cross_count} cross-platform original, {osa_count} OSA original")
        
        return standardized
    
    def export_standardized_csv(self, standardized_shortcuts: List[StandardizedShortcut], 
                              output_file: str):
        """Export standardized shortcuts to CSV with multiple format columns"""
        
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            # Write header with additional format columns
            f.write("software_name,platform,key_combination_standardized,key_combination_original,")
            f.write("mac_symbols_format,windows_text_format,title,description,category,")
            f.write("confidence_score,extraction_method,display_format\n")
            
            for std_shortcut in standardized_shortcuts:
                shortcut = std_shortcut.original
                
                # Escape CSV values
                def escape_csv(text):
                    if ',' in text or '"' in text or '\n' in text:
                        return '"' + text.replace('"', '""') + '"'
                    return text
                
                # Write row with all format variations
                f.write(f"{escape_csv(shortcut.software)},")
                f.write(f"{escape_csv(shortcut.platform)},")
                f.write(f"{escape_csv(std_shortcut.standardized_key)},")
                f.write(f"{escape_csv(shortcut.key_combination)},")
                f.write(f"{escape_csv(std_shortcut.alternative_formats.get('mac_symbols', ''))},")
                f.write(f"{escape_csv(std_shortcut.alternative_formats.get('windows_text', ''))},")
                f.write(f"{escape_csv(shortcut.title)},")
                f.write(f"{escape_csv(shortcut.description)},")
                f.write(f"{escape_csv(shortcut.category)},")
                f.write(f"{shortcut.confidence},")
                f.write(f"{escape_csv(shortcut.extraction_method)},")
                f.write(f"{escape_csv(std_shortcut.display_format)}\n")
        
        print(f"   📁 Standardized CSV exported: {output_file}")

def main():
    """Test the key standardizer"""
    
    # Test cases
    test_shortcuts = [
        ExtractedShortcut(
            software="Test App",
            platform="macOS",
            key_combination="Cmd+Shift+P",
            title="Command Palette",
            description="Open command palette",
            category="General",
            confidence=95.0,
            extraction_method="test"
        ),
        ExtractedShortcut(
            software="Test App",
            platform="Windows",
            key_combination="Ctrl+Alt+Delete",
            title="Task Manager",
            description="Open task manager",
            category="System",
            confidence=100.0,
            extraction_method="test"
        ),
        ExtractedShortcut(
            software="Test App",
            platform="Cross-platform",
            key_combination="F1",
            title="Help",
            description="Show help",
            category="Help",
            confidence=100.0,
            extraction_method="test"
        )
    ]
    
    standardizer = KeyStandardizer()
    
    print("🧪 Testing Key Standardizer")
    print("=" * 40)
    
    for shortcut in test_shortcuts:
        print(f"\nOriginal: {shortcut.key_combination} ({shortcut.platform})")
        
        std_shortcut = standardizer.standardize_shortcut(shortcut)
        
        print(f"Standardized: {std_shortcut.standardized_key}")
        print(f"Format: {std_shortcut.display_format}")
        print(f"Alternatives: {std_shortcut.alternative_formats}")

if __name__ == "__main__":
    main()