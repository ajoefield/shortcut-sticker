# Terraform Deployment Rule

**ALL infrastructure and Lambda function changes MUST be deployed through Terraform.**

## Required Commands
- **Deploy:** `source .envrc && terraform apply -auto-approve`
- **Plan:** `source .envrc && terraform plan`
- **Destroy:** `source .envrc && terraform destroy`

## Lambda Function Updates
When updating Lambda function code:

1. **Update code files** (lambda_function.py, requirements.txt)
2. **Rebuild zip package:** `python3 -m pip install -r requirements.txt -t . && zip -r pdf-converter.zip . -x "*.terraform*" "*.git*" "*.pyc" "__pycache__/*"`
3. **Force Terraform to detect changes:** `rm -f .terraform/terraform.tfstate.backup`
4. **Deploy:** `source .envrc && terraform apply -auto-approve`

## Never Use
- ❌ Manual AWS CLI commands
- ❌ AWS Console updates
- ❌ Direct boto3 deployment scripts
- ❌ `./deploy.sh` script

## Environment Setup
- Always source `.envrc` before Terraform commands
- Ensures proper AWS credentials and environment variables

This ensures consistent, tracked, and reproducible deployments.