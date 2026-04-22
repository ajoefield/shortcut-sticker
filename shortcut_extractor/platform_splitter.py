#!/usr/bin/env python3
"""
Platform Splitter - Converts cross-platform shortcuts into separate platform-specific entries
Eliminates "Cross-platform" and "All" entries for cleaner database integration
"""
import re
from typing import List, Dict, Tuple
from dataclasses import dataclass, replace
from extraction_engine import ExtractedShortcut

class PlatformSplitter:
    """Splits cross-platform shortcuts into separate macOS and Windows/Linux entries"""
    
    def __init__(self):
        # Mac-specific modifier patterns
        self.mac_modifiers = ['⌘', '⌥', '⇧', '⌃', 'cmd', 'command', 'option', 'shift']
        
        # Windows/Linux modifier patterns  
        self.windows_modifiers = ['ctrl', 'alt', 'shift', 'win']
        
        # Platform mapping
        self.platform_mapping = {
            'cross-platform': ['macOS', 'Windows'],
            'all': ['macOS', 'Windows'],
            'mac/windows': ['macOS', 'Windows'],
            'windows/linux': ['Windows'],  # Treat Windows/Linux as just Windows
            'linux': ['Windows']  # Linux uses Windows-style shortcuts
        }
    
    def split_shortcuts(self, shortcuts: List[ExtractedShortcut]) -> List[ExtractedShortcut]:
        """Split cross-platform shortcuts into platform-specific entries"""
        
        result_shortcuts = []
        
        for shortcut in shortcuts:
            platform_lower = shortcut.platform.lower()
            
            # Always split cross-platform shortcuts
            if self._is_cross_platform(shortcut):
                split_shortcuts = self._split_cross_platform_shortcut(shortcut)
                result_shortcuts.extend(split_shortcuts)
            else:
                # Clean up platform name and keep as-is
                cleaned_shortcut = self._clean_platform_name(shortcut)
                result_shortcuts.append(cleaned_shortcut)
        
        return result_shortcuts
    
    def _is_cross_platform(self, shortcut: ExtractedShortcut) -> bool:
        """Check if shortcut is cross-platform and needs splitting"""
        
        platform_lower = shortcut.platform.lower()
        key_combo = shortcut.key_combination
        
        # OSA tools should not be split - they're universal
        if platform_lower == 'osa':
            return False
        
        # Always split if platform is explicitly cross-platform
        cross_platform_indicators = ['cross-platform', 'cross_platform', 'crossplatform', 'all', 'universal', 'multiplatform']
        if any(indicator in platform_lower for indicator in cross_platform_indicators):
            return True
        
        # Check if key combination contains both Mac and Windows formats
        if '/' in key_combo and self._has_both_formats(key_combo):
            return True
        
        # Check if key combination has mixed format indicators
        if self._has_mixed_format_indicators(key_combo):
            return True
        
        return False
    
    def _has_mixed_format_indicators(self, key_combination: str) -> bool:
        """Check if key combination has both Mac and Windows style indicators"""
        
        key_lower = key_combination.lower()
        
        # Mac indicators
        has_mac = any(indicator in key_combination for indicator in ['⌘', '⌥', '⇧', '⌃']) or \
                  any(indicator in key_lower for indicator in ['cmd', 'command', 'option'])
        
        # Windows indicators  
        has_windows = any(indicator in key_lower for indicator in ['ctrl', 'alt']) and \
                     not any(indicator in key_combination for indicator in ['⌘', '⌥', '⇧', '⌃'])
        
        return has_mac and has_windows
    
    def _has_both_formats(self, key_combination: str) -> bool:
        """Check if key combination contains both Mac and Windows formats"""
        
        # Look for patterns like "⌘ + X / Ctrl+X" or "Cmd+C / Ctrl+C"
        parts = key_combination.split('/')
        if len(parts) != 2:
            return False
        
        left_part = parts[0].strip().lower()
        right_part = parts[1].strip().lower()
        
        # Check if left side has Mac indicators and right side has Windows indicators
        has_mac_left = any(mod in left_part for mod in ['⌘', '⌥', '⇧', '⌃', 'cmd', 'command', 'option'])
        has_windows_right = any(mod in right_part for mod in ['ctrl', 'alt', 'shift'])
        
        return has_mac_left and has_windows_right
    
    def _split_cross_platform_shortcut(self, shortcut: ExtractedShortcut) -> List[ExtractedShortcut]:
        """Split a cross-platform shortcut into separate platform entries"""
        
        result = []
        key_combo = shortcut.key_combination
        
        # Handle key combinations with "/" separator (e.g., "⌘ + X / Ctrl+X")
        if '/' in key_combo and self._has_both_formats(key_combo):
            parts = key_combo.split('/')
            mac_combo = parts[0].strip()
            windows_combo = parts[1].strip()
            
            # Create Mac version
            mac_shortcut = replace(shortcut, 
                                platform='macOS',
                                key_combination=mac_combo)
            result.append(mac_shortcut)
            
            # Create Windows version
            windows_shortcut = replace(shortcut,
                                     platform='Windows', 
                                     key_combination=windows_combo)
            result.append(windows_shortcut)
            
        else:
            # Handle shortcuts that are truly universal (like F1, F5, etc.)
            if self._is_universal_shortcut(key_combo):
                # Create identical entries for both platforms
                mac_shortcut = replace(shortcut, platform='macOS')
                windows_shortcut = replace(shortcut, platform='Windows')
                result.extend([mac_shortcut, windows_shortcut])
            else:
                # Try to determine platform from key combination
                if self._looks_like_mac_shortcut(key_combo):
                    result.append(replace(shortcut, platform='macOS'))
                elif self._looks_like_windows_shortcut(key_combo):
                    result.append(replace(shortcut, platform='Windows'))
                else:
                    # Default: create both versions with appropriate key formats
                    mac_combo = self._convert_to_mac_format(key_combo)
                    windows_combo = self._convert_to_windows_format(key_combo)
                    
                    mac_shortcut = replace(shortcut, 
                                         platform='macOS',
                                         key_combination=mac_combo)
                    windows_shortcut = replace(shortcut,
                                             platform='Windows',
                                             key_combination=windows_combo)
                    result.extend([mac_shortcut, windows_shortcut])
        
        return result
    
    def _is_universal_shortcut(self, key_combination: str) -> bool:
        """Check if shortcut is truly universal (function keys, etc.)"""
        
        key_lower = key_combination.lower().strip()
        
        # Function keys are universal
        if re.match(r'^f\d+$', key_lower):
            return True
        
        # Arrow keys, Home, End, etc.
        universal_keys = ['up', 'down', 'left', 'right', 'home', 'end', 
                         'pageup', 'pagedown', 'insert', 'delete', 'tab', 'enter', 'escape']
        
        return key_lower in universal_keys
    
    def _looks_like_mac_shortcut(self, key_combination: str) -> bool:
        """Check if shortcut looks Mac-specific"""
        
        key_lower = key_combination.lower()
        
        # Check for Mac-specific symbols or terms
        mac_indicators = ['⌘', '⌥', '⇧', '⌃', 'cmd', 'command', 'option']
        
        return any(indicator in key_lower for indicator in mac_indicators)
    
    def _looks_like_windows_shortcut(self, key_combination: str) -> bool:
        """Check if shortcut looks Windows-specific"""
        
        key_lower = key_combination.lower()
        
        # Check for Windows-specific terms
        windows_indicators = ['ctrl', 'alt', 'win', 'windows']
        
        # Also check if it has Ctrl but no Mac indicators
        has_ctrl = 'ctrl' in key_lower
        has_mac = any(indicator in key_lower for indicator in ['⌘', '⌥', '⇧', '⌃', 'cmd', 'command', 'option'])
        
        return any(indicator in key_lower for indicator in windows_indicators) or (has_ctrl and not has_mac)
    
    def _convert_to_mac_format(self, key_combination: str) -> str:
        """Convert key combination to Mac format"""
        
        # Simple conversion - replace common Windows modifiers with Mac equivalents
        mac_combo = key_combination
        
        # Replace Windows modifiers with Mac symbols
        replacements = {
            'ctrl': '⌃',
            'alt': '⌥', 
            'shift': '⇧',
            'win': '⌘'
        }
        
        for windows_mod, mac_symbol in replacements.items():
            mac_combo = re.sub(rf'\b{windows_mod}\b', mac_symbol, mac_combo, flags=re.IGNORECASE)
        
        # Clean up spacing around +
        mac_combo = re.sub(r'\s*\+\s*', ' + ', mac_combo)
        
        return mac_combo.strip()
    
    def _convert_to_windows_format(self, key_combination: str) -> str:
        """Convert key combination to Windows format"""
        
        # Simple conversion - replace Mac symbols with Windows modifiers
        windows_combo = key_combination
        
        # Replace Mac symbols with Windows modifiers
        replacements = {
            '⌘': 'Ctrl',
            '⌃': 'Ctrl', 
            '⌥': 'Alt',
            '⇧': 'Shift'
        }
        
        for mac_symbol, windows_mod in replacements.items():
            windows_combo = windows_combo.replace(mac_symbol, windows_mod)
        
        # Also handle text versions
        text_replacements = {
            'cmd': 'Ctrl',
            'command': 'Ctrl',
            'option': 'Alt'
        }
        
        for mac_text, windows_mod in text_replacements.items():
            windows_combo = re.sub(rf'\b{mac_text}\b', windows_mod, windows_combo, flags=re.IGNORECASE)
        
        # Clean up spacing - Windows format typically uses + without spaces
        windows_combo = re.sub(r'\s*\+\s*', '+', windows_combo)
        
        return windows_combo.strip()
    
    def _clean_platform_name(self, shortcut: ExtractedShortcut) -> ExtractedShortcut:
        """Clean up platform name for non-cross-platform shortcuts"""
        
        platform_lower = shortcut.platform.lower()
        
        # Keep OSA platform as-is
        if platform_lower == 'osa':
            return replace(shortcut, platform='OSA')
        
        # Normalize platform names
        if 'mac' in platform_lower:
            return replace(shortcut, platform='macOS')
        elif 'windows' in platform_lower or 'win' in platform_lower:
            return replace(shortcut, platform='Windows')
        elif 'linux' in platform_lower:
            # Treat Linux as Windows for shortcut purposes
            return replace(shortcut, platform='Windows')
        else:
            # Keep original if already clean
            return shortcut
    
    def get_platform_statistics(self, original_shortcuts: List[ExtractedShortcut], 
                              split_shortcuts: List[ExtractedShortcut]) -> Dict:
        """Get statistics about the platform splitting process"""
        
        original_platforms = {}
        split_platforms = {}
        
        # Count original platforms
        for shortcut in original_shortcuts:
            platform = shortcut.platform
            original_platforms[platform] = original_platforms.get(platform, 0) + 1
        
        # Count split platforms
        for shortcut in split_shortcuts:
            platform = shortcut.platform
            split_platforms[platform] = split_platforms.get(platform, 0) + 1
        
        return {
            'original_count': len(original_shortcuts),
            'split_count': len(split_shortcuts),
            'original_platforms': original_platforms,
            'split_platforms': split_platforms,
            'cross_platform_converted': len(split_shortcuts) - len(original_shortcuts)
        }

def main():
    """Test the platform splitter"""
    
    # Create test shortcuts
    test_shortcuts = [
        ExtractedShortcut(
            software="Test App",
            platform="Cross-platform",
            key_combination="⌘ + C / Ctrl+C",
            title="Copy",
            description="Copy selected item",
            category="General",
            confidence=100.0,
            extraction_method="test"
        ),
        ExtractedShortcut(
            software="Test App", 
            platform="All",
            key_combination="F5",
            title="Refresh",
            description="Refresh page",
            category="General",
            confidence=100.0,
            extraction_method="test"
        ),
        ExtractedShortcut(
            software="Test App",
            platform="macOS",
            key_combination="⌘ + Q",
            title="Quit",
            description="Quit application",
            category="General",
            confidence=100.0,
            extraction_method="test"
        ),
        ExtractedShortcut(
            software="Test App",
            platform="Windows/Linux", 
            key_combination="Ctrl+Alt+Delete",
            title="Task Manager",
            description="Open task manager",
            category="System",
            confidence=100.0,
            extraction_method="test"
        )
    ]
    
    splitter = PlatformSplitter()
    
    print("🧪 Testing Platform Splitter")
    print("=" * 40)
    
    print(f"\n📊 Original shortcuts: {len(test_shortcuts)}")
    for shortcut in test_shortcuts:
        print(f"   {shortcut.platform}: {shortcut.key_combination} → {shortcut.title}")
    
    # Split shortcuts
    split_shortcuts = splitter.split_shortcuts(test_shortcuts)
    
    print(f"\n📊 After splitting: {len(split_shortcuts)}")
    for shortcut in split_shortcuts:
        print(f"   {shortcut.platform}: {shortcut.key_combination} → {shortcut.title}")
    
    # Show statistics
    stats = splitter.get_platform_statistics(test_shortcuts, split_shortcuts)
    print(f"\n📈 Statistics:")
    print(f"   Original: {stats['original_count']} shortcuts")
    print(f"   Split: {stats['split_count']} shortcuts")
    print(f"   Cross-platform converted: {stats['cross_platform_converted']}")
    print(f"   Final platforms: {stats['split_platforms']}")

if __name__ == "__main__":
    main()