# Cross-Platform Shortcut Extraction Quality Assurance Spec

## Overview
This spec defines the quality assurance process for extracting keyboard shortcuts from cross-platform applications, ensuring accurate platform-specific outputs and identifying extraction issues.

## Problem Statement
Cross-platform applications (like RStudio, Docker, Kiro) often have documents with shortcuts for multiple platforms, but our extraction pipeline sometimes:
- Produces only single-platform outputs instead of both Windows and macOS
- Generates malformed shortcuts due to parsing errors
- Applies incorrect standardization that corrupts Mac symbols
- Lacks validation to catch extraction quality issues

## Requirements

### 1. Cross-Platform Detection & Processing
- **MUST** detect when source documents contain multiple platforms
- **MUST** generate separate output files for each platform (e.g., `rstudio_windows_shortcuts.csv`, `rstudio_macos_shortcuts.csv`)
- **MUST** use smart fallback when primary extraction fails to produce multi-platform outputs

### 2. Quality Validation System
- **MUST** run quality review after all extractions complete
- **MUST** validate platform count balance for cross-platform apps (tolerance: 20-30%)
- **MUST** identify malformed shortcuts using pattern detection + AI validation
- **MUST** separate confirmed malformed data from false positives

### 3. Extraction Accuracy
- **MUST** preserve original shortcut formats (no standardization corruption)
- **MUST** use document structure analysis to choose appropriate extraction method
- **MUST** apply Python-first extraction for known problematic document types
- **MUST** respect platform context from document structure (table columns, sections)

### 4. Output Organization
- **MUST** create clean separation: `latest/` for good data, `review/` for issues
- **MUST** generate quality reports with confidence scores and issue summaries
- **MUST** provide malformed shortcuts in separate CSV for manual review
- **MUST** track extraction statistics and success rates

## Implementation Tasks

### Phase 1: Smart Fallback Enhancement
- [ ] Improve Python-first extractor for vertical table structures (RStudio style)
- [ ] Enhance cross-platform detection accuracy
- [ ] Add document context to platform determination logic

### Phase 2: AI Validation Integration
- [ ] Implement AI-powered malformed shortcut validation
- [ ] Create application-specific validation rules (Vim single letters, etc.)
- [ ] Generate suggested corrections for invalid shortcuts

### Phase 3: Quality Metrics Dashboard
- [ ] Create extraction success rate tracking
- [ ] Add confidence score trending
- [ ] Implement automated quality alerts for low-confidence extractions

## Success Criteria
1. **Cross-platform apps produce both Windows and macOS files** (currently: RStudio ✅, others pending)
2. **Malformed shortcuts < 5%** of total extractions (currently: ~20%)
3. **Quality review identifies 90%+ of actual issues** with minimal false positives
4. **Zero standardization corruption** of Mac shortcuts (currently: ✅ disabled)

## Testing Strategy
- Test with known problematic documents (RStudio, Kiro cross-platform PDFs)
- Validate AI shortcut validation accuracy against manual review
- Measure extraction quality improvements over time
- Test fallback system effectiveness on edge cases

## Files Referenced
- `shortcut_extractor/smart_fallback_system.py` - Core fallback logic
- `shortcut_extractor/quality_reviewer.py` - Quality validation
- `shortcut_extractor/ai_shortcut_validator.py` - AI validation
- `shortcut_extractor/python_first_extractor.py` - Alternative extraction
- `shortcut_extractor/document_structure_analyzer.py` - Document analysis

## Notes
- Prioritize accuracy over automation - better to flag for manual review than produce bad data
- Mac shortcuts should never be standardized/converted - preserve original symbols
- Cross-platform detection should use document structure context, not just key patterns
- Quality review should run last to catch all issues before final output