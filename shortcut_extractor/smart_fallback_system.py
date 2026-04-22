#!/usr/bin/env python3
"""
Smart Fallback System - Detects when cross-platform extraction fails
and automatically retries with Python-first extraction
"""
from typing import List, Dict, Tuple
from pathlib import Path
from extraction_engine import ExtractedShortcut
from python_first_extractor import PythonFirstExtractor

class SmartFallbackSystem:
    """Detects extraction problems and applies appropriate fallbacks"""
    
    def __init__(self):
        self.python_extractor = PythonFirstExtractor()
        
        # Problem detection criteria
        self.cross_platform_apps = [
            'rstudio', 'kiro', 'docker', 'intellij', 'vscode'
        ]
    
    def check_and_fix_extraction(self, shortcuts: List[ExtractedShortcut], 
                               classification_result, source_text: str) -> Tuple[List[ExtractedShortcut], bool]:
        """Check extraction results and apply fallbacks if needed"""
        
        problems = self._detect_problems(shortcuts, classification_result)
        
        if not problems:
            return shortcuts, False  # No problems, return original
        
        print(f"   🚨 Problems detected: {', '.join(problems)}")
        
        # Apply appropriate fallback
        if 'cross_platform_single_output' in problems:
            return self._fix_cross_platform_problem(shortcuts, classification_result, source_text)
        elif 'no_shortcuts_extracted' in problems:
            return self._fix_no_shortcuts_problem(shortcuts, classification_result, source_text)
        elif 'low_shortcut_count' in problems:
            return self._fix_low_count_problem(shortcuts, classification_result, source_text)
        elif 'platform_mismatch' in problems:
            return self._fix_platform_mismatch(shortcuts, classification_result, source_text)
        
        return shortcuts, False
    
    def _detect_problems(self, shortcuts: List[ExtractedShortcut], 
                        classification_result) -> List[str]:
        """Detect various extraction problems"""
        
        problems = []
        
        # Problem 1: Cross-platform file should have multiple platforms but doesn't
        if classification_result.platform == 'Cross-platform':
            platforms = set(shortcut.platform for shortcut in shortcuts)
            
            if len(platforms) == 1:
                problems.append('cross_platform_single_output')
                print(f"   ❌ Cross-platform file has only {platforms} output")
            elif len(platforms) == 0:
                problems.append('no_shortcuts_extracted')
                print(f"   ❌ Cross-platform file extracted 0 shortcuts")
        
        # Problem 2: Very low shortcut count for known apps
        software_lower = classification_result.software_name.lower()
        expected_min_shortcuts = self._get_expected_shortcut_count(software_lower)
        
        if len(shortcuts) < expected_min_shortcuts:
            problems.append('low_shortcut_count')
            print(f"   ❌ Only {len(shortcuts)} shortcuts, expected at least {expected_min_shortcuts}")
        
        # Problem 3: Platform mismatch (OSA file with Windows/Mac platforms)
        if classification_result.platform == 'OSA':
            non_osa_platforms = [s.platform for s in shortcuts if s.platform != 'OSA']
            if non_osa_platforms:
                problems.append('platform_mismatch')
                print(f"   ❌ OSA file has non-OSA platforms: {set(non_osa_platforms)}")
        
        return problems
    
    def _get_expected_shortcut_count(self, software_name: str) -> int:
        """Get expected minimum shortcut count for known software"""
        
        expectations = {
            'rstudio': 30,
            'vscode': 40,
            'vs code': 40,
            'intellij': 50,
            'vim': 50,
            'docker': 15,
            'kiro': 20,
            'sublime': 25
        }
        
        for app, min_count in expectations.items():
            if app in software_name:
                return min_count
        
        return 10  # Default minimum
    
    def _fix_no_shortcuts_problem(self, shortcuts: List[ExtractedShortcut], 
                                 classification_result, source_text: str) -> Tuple[List[ExtractedShortcut], bool]:
        """Fix case where no shortcuts were extracted"""
        
        print(f"   🔧 Applying Python-first fallback for no shortcuts extracted...")
        
        # Use Python-first extractor
        python_result = self.python_extractor.extract_shortcuts(
            source_text, classification_result.software_name, classification_result
        )
        
        if len(python_result.shortcuts) > 0:
            print(f"   ✅ Python extractor found {len(python_result.shortcuts)} shortcuts vs 0")
            return python_result.shortcuts, True
        
        print(f"   ❌ Python extractor also found 0 shortcuts")
        return shortcuts, False
    
    def _fix_cross_platform_problem(self, shortcuts: List[ExtractedShortcut], 
                                   classification_result, source_text: str) -> Tuple[List[ExtractedShortcut], bool]:
        
        print(f"   🔧 Applying Python-first fallback for cross-platform issue...")
        
        # Use Python-first extractor
        python_result = self.python_extractor.extract_shortcuts(
            source_text, classification_result.software_name, classification_result
        )
        
        if len(python_result.shortcuts) > len(shortcuts):
            print(f"   ✅ Python extractor found {len(python_result.shortcuts)} shortcuts vs {len(shortcuts)}")
            
            # Check if we now have multiple platforms
            python_platforms = set(s.platform for s in python_result.shortcuts)
            if len(python_platforms) > 1:
                print(f"   ✅ Now has multiple platforms: {python_platforms}")
                return python_result.shortcuts, True
        
        # If Python didn't help, try cross-platform processor on original
        print(f"   🔄 Trying cross-platform processor fallback...")
        from cross_platform_processor import CrossPlatformProcessor
        processor = CrossPlatformProcessor()
        
        processed_shortcuts = processor.process_cross_platform_shortcuts(shortcuts, source_text)
        
        if len(processed_shortcuts) > len(shortcuts):
            print(f"   ✅ Cross-platform processor expanded to {len(processed_shortcuts)} shortcuts")
            return processed_shortcuts, True
        
        print(f"   ❌ Fallbacks didn't resolve cross-platform issue")
        return shortcuts, False
    
    def _fix_low_count_problem(self, shortcuts: List[ExtractedShortcut], 
                              classification_result, source_text: str) -> Tuple[List[ExtractedShortcut], bool]:
        """Fix low shortcut count by using Python-first extraction"""
        
        print(f"   🔧 Applying Python-first fallback for low count issue...")
        
        python_result = self.python_extractor.extract_shortcuts(
            source_text, classification_result.software_name, classification_result
        )
        
        if len(python_result.shortcuts) > len(shortcuts):
            print(f"   ✅ Python extractor found {len(python_result.shortcuts)} vs {len(shortcuts)} shortcuts")
            return python_result.shortcuts, True
        
        print(f"   ❌ Python extractor didn't improve shortcut count")
        return shortcuts, False
    
    def _fix_platform_mismatch(self, shortcuts: List[ExtractedShortcut], 
                              classification_result, source_text: str) -> Tuple[List[ExtractedShortcut], bool]:
        """Fix platform mismatch issues"""
        
        print(f"   🔧 Fixing platform mismatch...")
        
        # For OSA files, force all shortcuts to OSA platform
        if classification_result.platform == 'OSA':
            fixed_shortcuts = []
            for shortcut in shortcuts:
                if shortcut.platform != 'OSA':
                    # Create corrected shortcut
                    from dataclasses import replace
                    fixed_shortcut = replace(shortcut, platform='OSA')
                    fixed_shortcuts.append(fixed_shortcut)
                else:
                    fixed_shortcuts.append(shortcut)
            
            print(f"   ✅ Corrected {len([s for s in shortcuts if s.platform != 'OSA'])} platform mismatches")
            return fixed_shortcuts, True
        
        return shortcuts, False
    
    def should_use_python_first(self, classification_result, structure_analysis=None) -> bool:
        """Determine if we should use Python-first extraction from the start"""
        
        # Use Python-first for known problematic combinations
        software_lower = classification_result.software_name.lower()
        
        # Always use Python-first for table-format cross-platform documents
        if (classification_result.platform == 'Cross-platform' and 
            structure_analysis and 
            structure_analysis.format_type == 'table' and
            structure_analysis.platform_organization == 'columns'):
            return True
        
        # Use Python-first for known problematic apps
        problematic_apps = ['rstudio']
        if any(app in software_lower for app in problematic_apps):
            return True
        
        return False

def main():
    """Test the smart fallback system"""
    
    fallback = SmartFallbackSystem()
    
    # Test case 1: Cross-platform file with single platform output (problem)
    from extraction_engine import ExtractedShortcut
    
    problem_shortcuts = [
        ExtractedShortcut(
            software="RStudio",
            platform="Windows",  # Only Windows, should be both
            key_combination="Ctrl+L",
            title="Clear console",
            description="Clear console",
            category="General",
            confidence=100.0,
            extraction_method="simple_ai_claude"
        )
    ]
    
    class MockClassification:
        def __init__(self):
            self.software_name = "RStudio"
            self.platform = "Cross-platform"  # Should produce both platforms
    
    classification = MockClassification()
    source_text = "Console\nDescription Windows Mac\nClear console Ctrl+L Cmd+L"
    
    print("🧪 Testing Smart Fallback System")
    print(f"Input: {len(problem_shortcuts)} shortcuts (Windows only)")
    
    fixed_shortcuts, was_fixed = fallback.check_and_fix_extraction(
        problem_shortcuts, classification, source_text
    )
    
    print(f"\nOutput: {len(fixed_shortcuts)} shortcuts, Fixed: {was_fixed}")
    
    if was_fixed:
        platforms = set(s.platform for s in fixed_shortcuts)
        print(f"Platforms: {platforms}")
        
        for shortcut in fixed_shortcuts:
            print(f"   {shortcut.platform}: {shortcut.key_combination} → {shortcut.title}")

if __name__ == "__main__":
    main()