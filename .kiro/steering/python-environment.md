---
inclusion: always
---

# Python Environment Configuration

## Extraction Pipeline Environment

For the shortcut extraction pipeline, always use the pre-configured Python virtual environment:

**Environment Path**: `/Users/joefeelap/Create Web Apps/enhanced_pipeline_env_312`

### Activation Commands

```bash
# Activate the environment
source /Users/joefeelap/Create\ Web\ Apps/enhanced_pipeline_env_312/bin/activate

# Or use the full path directly
/Users/joefeelap/Create\ Web\ Apps/enhanced_pipeline_env_312/bin/python
```

### Usage Rules

1. **Always activate this environment** before running extraction pipeline scripts
2. **Use this Python interpreter** for all shortcut_extractor/ scripts
3. **Dependencies are pre-installed** - no need to install packages
4. **AWS credentials** should be configured via `awslogin` alias

### Quick Commands

```bash
# Activate environment and run extraction
source /Users/joefeelap/Create\ Web\ Apps/enhanced_pipeline_env_312/bin/activate
python shortcut_extractor/run_extraction.py

# Or run directly without activation
/Users/joefeelap/Create\ Web\ Apps/enhanced_pipeline_env_312/bin/python shortcut_extractor/run_extraction.py
```

### Environment Contents

This environment contains all required dependencies:
- PyMuPDF (fitz) for PDF processing
- boto3 for AWS services
- pandas for data processing
- All other extraction pipeline dependencies

### Troubleshooting

If extraction fails:
1. Ensure AWS login: `awslogin`
2. Check environment activation
3. Verify source files exist in `source_keyboard_shortcuts/`