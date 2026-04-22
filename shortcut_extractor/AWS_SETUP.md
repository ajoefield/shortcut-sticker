# AWS AI Setup Guide

This guide helps you configure AWS Bedrock and Textract for AI-enhanced shortcut extraction and review.

## 🚀 Quick Setup

### 1. AWS Account Setup

1. **Create AWS Account** (if you don't have one)
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Sign up for a free account

2. **Enable Required Services**
   - **AWS Bedrock**: For AI review using Claude
   - **AWS Textract**: For advanced OCR processing

### 2. AWS Credentials Configuration

Choose one of these methods:

#### Option A: AWS SSO (Recommended for Organizations)
```bash
# Configure SSO (one-time setup)
aws configure sso
# Follow prompts to set up your SSO profile

# Login when needed
aws sso login --profile "developer_playground"

# Test connection
aws sts get-caller-identity --profile "developer_playground"

# Use with pipeline
python extract_shortcuts.py --use-ai --aws-profile "developer_playground" --process-all
```

#### Option B: AWS CLI (Individual Accounts)
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

#### Option C: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

#### Option D: IAM Role (for EC2)
If running on EC2, attach an IAM role with the required permissions.

### 3. Enable AWS Bedrock

1. **Go to AWS Bedrock Console**
   - Navigate to [Bedrock Console](https://console.aws.amazon.com/bedrock/)
   - Select your region (us-east-1 recommended)

2. **Request Model Access**
   - Go to "Model access" in the left sidebar
   - Click "Request model access"
   - Enable **Anthropic Claude 3 Haiku**
   - Submit request (usually approved instantly)

3. **Verify Access**
   ```bash
   aws bedrock list-foundation-models --region us-east-1
   ```

### 4. Enable AWS Textract

Textract is available by default in most regions. No special setup required.

## 🔧 Required IAM Permissions

Create an IAM policy with these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:ListFoundationModels"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "textract:DetectDocumentText",
                "textract:AnalyzeDocument"
            ],
            "Resource": "*"
        }
    ]
}
```

## 💰 Cost Estimation

### AWS Bedrock (Claude 3 Haiku)
- **Input**: $0.25 per 1M tokens
- **Output**: $1.25 per 1M tokens
- **Typical usage**: ~$0.01-0.05 per PDF review

### AWS Textract
- **Document Text Detection**: $1.50 per 1,000 pages
- **Free Tier**: 1,000 pages per month for 3 months
- **Typical usage**: ~$0.0015 per PDF page

### Example Monthly Costs
- **100 PDFs/month** (avg 5 pages each): ~$2-5 total
- **1000 PDFs/month**: ~$20-50 total

Much cheaper than OpenAI GPT-4!

## 🧪 Testing Your Setup

1. **Test AWS SSO Connection**
   ```bash
   # Login first
   aws sso login --profile "developer_playground"
   
   # Test AI reviewer
   python ai_reviewer.py "developer_playground"
   ```

2. **Test with Pipeline**
   ```bash
   python extract_shortcuts.py --use-ai --aws-profile "developer_playground" --process-all
   ```

3. **Test Different Region**
   ```bash
   python extract_shortcuts.py --use-ai --aws-profile "developer_playground" --aws-region us-west-2 --process-all
   ```

## 🌍 Supported Regions

### Bedrock Availability
- **us-east-1** (N. Virginia) ✅ Recommended
- **us-west-2** (Oregon) ✅
- **eu-west-1** (Ireland) ✅
- **ap-southeast-1** (Singapore) ✅

### Textract Availability
Available in most AWS regions. Check [AWS documentation](https://docs.aws.amazon.com/general/latest/gr/textract.html) for current list.

## 🔍 Troubleshooting

### "AWS credentials not found"
```bash
# For SSO users
aws sso login --profile "your-profile-name"
aws sts get-caller-identity --profile "your-profile-name"

# For regular AWS CLI
aws sts get-caller-identity
aws configure
```

### "SSO session expired"
```bash
# Re-login to SSO
aws sso login --profile "developer_playground"

# Check session status
aws sts get-caller-identity --profile "developer_playground"
```

### "Access denied to Bedrock"
1. Check model access in Bedrock console
2. Verify IAM permissions
3. Try different region

### "Textract not available"
1. Check region support
2. Verify IAM permissions
3. Check service quotas

### "Model not found"
Make sure you've requested access to Claude 3 Haiku in the Bedrock console.

## 🚀 Usage Examples

### AWS SSO Authentication
```bash
# Login to AWS SSO
aws sso login --profile "developer_playground"

# Basic AI review with SSO
python extract_shortcuts.py --use-ai --aws-profile "developer_playground" --process-all

# Custom confidence threshold
python extract_shortcuts.py --use-ai --aws-profile "developer_playground" --confidence 60 --process-new

# Specific region
python extract_shortcuts.py --use-ai --aws-profile "developer_playground" --aws-region us-west-2 --process-all
```

### Regular AWS CLI
```bash
# Basic AI review
python extract_shortcuts.py --use-ai --process-all

# Advanced OCR + AI
python extract_shortcuts.py --use-ai --aws-region us-east-1 --confidence 60
```

### Batch Processing
```bash
# Process large batches with AI
python extract_shortcuts.py --use-ai --aws-profile "developer_playground" --process-new --confidence 80
```

## 📊 AI Features

### Intelligent Review
- ✅ Validates key combinations
- ✅ Corrects formatting errors
- ✅ Standardizes naming conventions
- ✅ Filters invalid shortcuts
- ✅ Improves confidence scores

### Advanced OCR
- ✅ Better text recognition than Tesseract
- ✅ Handles complex layouts
- ✅ Processes scanned documents
- ✅ Extracts from screenshots

### Cost Optimization
- ✅ Only reviews low-confidence items
- ✅ Batch processing for efficiency
- ✅ Configurable confidence thresholds
- ✅ Fallback to free methods

## 🔒 Security Best Practices

1. **Use IAM Roles** when possible (EC2, Lambda)
2. **Rotate Access Keys** regularly
3. **Limit Permissions** to minimum required
4. **Monitor Usage** in AWS CloudTrail
5. **Set Billing Alerts** to avoid surprises

## 📞 Support

If you encounter issues:

1. Check AWS service health
2. Verify credentials and permissions
3. Test with AWS CLI commands
4. Check CloudTrail logs for errors
5. Contact AWS support if needed

---

**Ready to use AI-powered shortcut extraction? Configure your AWS credentials and run with `--use-ai` flag!** 🤖