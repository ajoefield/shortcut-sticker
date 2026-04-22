# AWS Deployment Guide for Shortcut Extractor

## Architecture Overview

The shortcut extraction system is designed for serverless deployment on AWS with the following components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   S3 Bucket     │    │  Lambda Function │    │   DynamoDB      │
│  (PDF Storage)  │───▶│  (Extraction)    │───▶│  (Metadata)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │              ┌──────────────────┐              │
         │              │  EventBridge     │              │
         └──────────────│  (Scheduling)    │──────────────┘
                        └──────────────────┘
                                 │
                        ┌──────────────────┐
                        │  API Gateway     │
                        │  (Sticker App)   │
                        └──────────────────┘
```

## Components

### 1. S3 Bucket (PDF Storage)
- **Purpose**: Store PDF files and extraction results
- **Structure**:
  ```
  keyboard-shortcuts-source/
  ├── source_files/               # Input PDFs and PNGs
  │   ├── VSCode_macOS_shortcuts.pdf
  │   ├── Figma_Windows_screenshot.png
  │   ├── Sublime_macOS_shortcuts.pdf
  │   └── ...
  ├── results/                 # Extraction results
  │   ├── csv_exports/
  │   ├── json_exports/
  │   └── library_index.json
  └── metadata/               # Version tracking
      ├── software_versions.json
      └── library_metadata.json
  ```

### 2. Lambda Function (Extraction Engine)
- **Runtime**: Python 3.9+
- **Memory**: 1024 MB (for PDF processing)
- **Timeout**: 15 minutes
- **Triggers**:
  - S3 upload events (new PDFs)
  - EventBridge schedule (daily scans)
  - API Gateway (manual requests)

### 3. DynamoDB (Optional - Metadata Storage)
- **Purpose**: Store software versions and extraction metadata
- **Tables**:
  - `shortcut-software-versions`
  - `shortcut-library-metadata`

### 4. EventBridge (Scheduling)
- **Purpose**: Trigger daily scans for updates
- **Schedule**: `rate(1 day)` or `cron(0 6 * * ? *)`

### 5. API Gateway (Sticker App Interface)
- **Purpose**: Provide REST API for the sticker application
- **Endpoints**:
  - `GET /status` - Library status
  - `GET /search?q=term` - Search shortcuts
  - `GET /software` - List available software
  - `POST /extract` - Manual extraction

## Deployment Steps

### 1. Create S3 Bucket
```bash
aws s3 mb s3://keyboard-shortcuts-source-your-account
aws s3api put-bucket-versioning \
  --bucket keyboard-shortcuts-source-your-account \
  --versioning-configuration Status=Enabled
```

### 2. Create IAM Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::shortcut-pdfs-your-account",
        "arn:aws:s3:::shortcut-pdfs-your-account/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:foundation-model/anthropic.claude-3-haiku-*"
    }
  ]
}
```

### 3. Package Lambda Function
```bash
# Create deployment package
cd shortcut_extractor
pip install -r requirements.txt -t ./package
cp *.py ./package/
cd package
zip -r ../shortcut-extractor.zip .
```

### 4. Deploy Lambda Function
```bash
aws lambda create-function \
  --function-name shortcut-extractor \
  --runtime python3.9 \
  --role arn:aws:iam::YOUR-ACCOUNT:role/shortcut-extractor-role \
  --handler aws_lambda_handler.lambda_handler \
  --zip-file fileb://shortcut-extractor.zip \
  --timeout 900 \
  --memory-size 1024 \
  --environment Variables='{
    "S3_BUCKET":"shortcut-pdfs-your-account",
    "AWS_DEFAULT_REGION":"us-east-1"
  }'
```

### 5. Configure S3 Trigger
```bash
aws s3api put-bucket-notification-configuration \
  --bucket shortcut-pdfs-your-account \
  --notification-configuration '{
    "LambdaConfigurations": [{
      "Id": "pdf-upload-trigger",
      "LambdaFunctionArn": "arn:aws:lambda:us-east-1:YOUR-ACCOUNT:function:shortcut-extractor",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [{
            "Name": "suffix",
            "Value": ".pdf"
          }]
        }
      }
    }]
  }'
```

### 6. Create EventBridge Schedule
```bash
aws events put-rule \
  --name shortcut-daily-scan \
  --schedule-expression "rate(1 day)" \
  --description "Daily scan for shortcut updates"

aws events put-targets \
  --rule shortcut-daily-scan \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:YOUR-ACCOUNT:function:shortcut-extractor","Input"='{"eventType":"scheduled_scan"}'
```

### 7. Create API Gateway
```bash
aws apigateway create-rest-api \
  --name shortcut-api \
  --description "API for shortcut sticker application"
```

## Event Types

### S3 Upload Event
```json
{
  "eventType": "s3_upload",
  "Records": [{
    "s3": {
      "bucket": {"name": "shortcut-pdfs-your-account"},
      "object": {"key": "pdfs/VSCode_v1.85_macOS_shortcuts.pdf"}
    }
  }]
}
```

### Scheduled Scan Event
```json
{
  "eventType": "scheduled_scan",
  "s3_bucket": "shortcut-pdfs-your-account"
}
```

### Manual Extraction Event
```json
{
  "eventType": "manual_extraction",
  "software": ["vscode", "sublime"],
  "force": false,
  "s3_bucket": "shortcut-pdfs-your-account"
}
```

## API Endpoints for Sticker App

### Get Library Status
```bash
GET /status
Response: {
  "status": "success",
  "report": "Library status report...",
  "metadata": {
    "total_software": 15,
    "total_shortcuts": 1250,
    "last_scan": "2024-01-09T20:32:11Z"
  }
}
```

### Search Shortcuts
```bash
GET /search?q=copy&software=vscode&platform=macos
Response: {
  "query": "copy",
  "results": [
    {
      "software_name": "VS Code",
      "platform": "macOS",
      "key_combination_standardized": "⌘ + C",
      "title": "Copy line",
      "description": "Copy current line",
      "category": "General"
    }
  ],
  "total_found": 25
}
```

### Get Software List
```bash
GET /software
Response: {
  "software": {
    "vscode_macos": {
      "name": "VS Code",
      "platform": "macOS",
      "shortcut_count": 85,
      "version_info": {...}
    }
  },
  "platforms": ["macOS", "Windows", "Linux"],
  "categories": ["General", "Navigation", "Editing"]
}
```

## Cost Estimation

### Monthly Costs (estimated):
- **Lambda**: $5-15 (based on extraction frequency)
- **S3**: $1-5 (storage and requests)
- **Bedrock**: $10-30 (Claude API calls)
- **API Gateway**: $1-5 (API requests)
- **Total**: ~$17-55/month

### Cost Optimization:
- Use S3 Intelligent Tiering for old results
- Implement caching to reduce Bedrock calls
- Use reserved capacity for predictable workloads

## Monitoring and Alerts

### CloudWatch Metrics:
- Lambda execution duration
- Error rates
- S3 upload events
- Bedrock API costs

### Alerts:
- Extraction failures
- High processing times
- Cost thresholds exceeded

## Security Considerations

1. **IAM Roles**: Least privilege access
2. **S3 Bucket**: Private with specific access policies
3. **API Gateway**: Rate limiting and authentication
4. **Lambda**: VPC configuration if needed
5. **Encryption**: At rest and in transit

## Scaling Considerations

1. **Concurrent Extractions**: Lambda can handle multiple PDFs simultaneously
2. **Large PDFs**: Increase Lambda memory and timeout
3. **High Volume**: Consider Step Functions for orchestration
4. **Global Distribution**: CloudFront for API caching

This architecture provides a robust, scalable foundation for the shortcut sticker application with intelligent update detection and cost-effective processing.