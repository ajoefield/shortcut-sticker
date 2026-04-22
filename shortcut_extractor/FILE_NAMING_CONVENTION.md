# File Naming Convention for Keyboard Shortcut Sources

## Standard Format for PDFs
```
{Software}_{Platform}_shortcuts.pdf
```

## Standard Format for PNG Images
```
{Software}_{Platform}_screenshot.png
{Software}_{Platform}_shortcuts.png
{Software}_{Platform}_keymap.png
```

## Examples

### PDF Files
- `VSCode_Windows_shortcuts.pdf`
- `VSCode_macOS_shortcuts.pdf`
- `IntelliJ_Cross-platform_shortcuts.pdf`
- `Sublime_macOS_shortcuts.pdf`
- `Vim_Cross-platform_shortcuts.pdf`
- `RStudio_Cross-platform_shortcuts.pdf`
- `Docker_Cross-platform_shortcuts.pdf`

### PNG Files
- `VSCode_Windows_screenshot.png`
- `Figma_macOS_shortcuts.png`
- `Notion_Cross-platform_keymap.png`
- `Sublime_macOS_screenshot.png`
- `CustomApp_v2024_Windows_shortcuts.png`

## Platform Options
- `Windows` - Windows-specific shortcuts
- `macOS` - Mac-specific shortcuts  
- `Linux` - Linux-specific shortcuts
- `Cross-platform` - Contains shortcuts for multiple platforms

## Software Name Guidelines
- Use official software names (capitalized properly)
- No spaces in software names (use camelCase or underscores)
- Common abbreviations are acceptable (VSCode, IntelliJ)

## Multi-Platform Files
When a single file contains shortcuts for multiple platforms:
- Use `Cross-platform` as the platform
- The AI parser will automatically detect and separate platform-specific shortcuts
- Examples: 
  - `RStudio_Cross-platform_shortcuts.pdf`
  - `Figma_Cross-platform_screenshot.png`

## Version Information
Include version numbers when available:
- `VSCode_v1.85_macOS_shortcuts.pdf`
- `Figma_v2024_Windows_screenshot.png`
- `CustomApp_v2.1.3_Cross-platform_shortcuts.pdf`

## Benefits
1. **Clear identification** of software and target platform
2. **Consistent processing** - AI parser handles all variations
3. **Better organization** in file systems
4. **Automated classification** based on filename
5. **Easier maintenance** and updates
6. **Version tracking** for software updates

## Migration from Existing Files
Current files can be renamed to follow this convention:

### PDFs
- `Sublime Keyboard Shortcuts.pdf` → `Sublime_macOS_shortcuts.pdf`
- `VScode Keyboard shortcuts WINDOWS.pdf` → `VSCode_Windows_shortcuts.pdf`
- `RStudio keyboard Shortcut.pdf` → `RStudio_Cross-platform_shortcuts.pdf`

### PNGs
- `figma-shortcuts.png` → `Figma_macOS_screenshot.png`
- `vscode-keys.png` → `VSCode_Windows_shortcuts.png`
- `notion-hotkeys.png` → `Notion_Cross-platform_keymap.png`