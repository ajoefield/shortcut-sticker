#!/usr/bin/env python3
"""
AWS Lambda Handler for Shortcut Extraction
Designed for serverless deployment and event-driven processing
"""
import json
import boto3
from pathlib import Path
from typing import Dict, Any, List
from simple_extraction_engine import SimpleExtractionEngine
from library_manager import ShortcutLibraryManager

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler for shortcut extraction
    
    Event types:
    1. S3 trigger - New PDF uploaded
    2. Scheduled scan - Check all PDFs for updates
    3. Manual trigger - Force extraction of specific software
    """
    
    try:
        # Parse event type
        event_type = event.get('eventType', 'manual')
        
        if event_type == 's3_upload':
            return handle_s3_upload(event, context)
        elif event_type == 'scheduled_scan':
            return handle_scheduled_scan(event, context)
        elif event_type == 'manual_extraction':
            return handle_manual_extraction(event, context)
        else:
            return handle_api_request(event, context)
            
    except Exception as e:
        print(f"❌ Lambda error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Extraction failed'
            })
        }

def handle_s3_upload(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handle new PDF uploaded to S3"""
    
    print("📁 Processing S3 upload event")
    
    # Extract S3 info from event
    s3_bucket = event['Records'][0]['s3']['bucket']['name']
    s3_key = event['Records'][0]['s3']['object']['key']
    
    print(f"   📄 File: s3://{s3_bucket}/{s3_key}")
    
    # Download PDF from S3
    s3_client = boto3.client('s3')
    local_path = f"/tmp/{Path(s3_key).name}"
    
    s3_client.download_file(s3_bucket, s3_key, local_path)
    
    # Initialize extraction engine
    engine = SimpleExtractionEngine()
    
    # Extract shortcuts from single PDF
    result = engine.extract_shortcuts(Path(local_path))
    
    if result.success:
        # Upload results back to S3
        upload_results_to_s3(result, s3_bucket, s3_key)
        
        # Update library index
        engine.library_manager.generate_library_index()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Successfully extracted {len(result.shortcuts)} shortcuts',
                'software': result.classification.software_name,
                'platform': result.classification.platform,
                'shortcuts_count': len(result.shortcuts)
            })
        }
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'error': result.error_message,
                'message': 'Extraction failed'
            })
        }

def handle_scheduled_scan(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handle scheduled library scan (e.g., daily check for updates)"""
    
    print("⏰ Processing scheduled scan")
    
    # Initialize managers
    engine = SimpleExtractionEngine()
    manager = ShortcutLibraryManager()
    
    # Download all PDFs from S3
    s3_bucket = event.get('s3_bucket', 'shortcut-pdfs')
    pdf_folder = download_pdfs_from_s3(s3_bucket)
    
    # Scan for changes
    status = manager.scan_for_changes(pdf_folder)
    
    # Extract only what needs updating
    results = engine.smart_batch_extract(pdf_folder)
    
    # Upload results back to S3
    if results:
        upload_batch_results_to_s3(results, s3_bucket)
        
        # Generate updated library index
        manager.generate_library_index()
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Scheduled scan completed',
            'new_software': len(status.new_software),
            'updated_software': len(status.updated_software),
            'total_processed': len(results),
            'total_shortcuts': sum(len(r.shortcuts) for r in results if r.success)
        })
    }

def handle_manual_extraction(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handle manual extraction request"""
    
    print("🔧 Processing manual extraction")
    
    software_list = event.get('software', [])  # List of specific software to extract
    force_update = event.get('force', False)   # Force re-extraction even if up to date
    
    engine = SimpleExtractionEngine()
    
    # Download PDFs from S3
    s3_bucket = event.get('s3_bucket', 'shortcut-pdfs')
    pdf_folder = download_pdfs_from_s3(s3_bucket)
    
    # Filter PDFs if specific software requested
    if software_list:
        pdf_files = []
        for pdf_path in pdf_folder.glob("*.pdf"):
            software_key = engine.library_manager._get_software_key(pdf_path.name)
            if any(software in software_key.lower() for software in software_list):
                pdf_files.append(pdf_path)
    else:
        pdf_files = list(pdf_folder.glob("*.pdf"))
    
    # Extract shortcuts
    results = []
    for pdf_path in pdf_files:
        if force_update or engine.library_manager.should_extract(pdf_path)[0]:
            result = engine.extract_shortcuts(pdf_path)
            results.append(result)
    
    # Upload results
    if results:
        upload_batch_results_to_s3(results, s3_bucket)
        engine.library_manager.generate_library_index()
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Manual extraction completed',
            'processed_files': len(results),
            'total_shortcuts': sum(len(r.shortcuts) for r in results if r.success)
        })
    }

def handle_api_request(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handle API Gateway request for library status or search"""
    
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    
    if path == '/status':
        return get_library_status()
    elif path == '/search':
        query = event.get('queryStringParameters', {}).get('q', '')
        return search_shortcuts(query)
    elif path == '/applications':
        return get_software_list()
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Endpoint not found'})
        }

def get_library_status() -> Dict[str, Any]:
    """Get current library status"""
    
    manager = ShortcutLibraryManager()
    status_report = manager.get_status_report()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'status': 'success',
            'report': status_report,
            'metadata': manager.library_status.__dict__
        })
    }

def search_shortcuts(query: str) -> Dict[str, Any]:
    """Search shortcuts for the sticker app"""
    
    manager = ShortcutLibraryManager()
    
    # Load library index
    if manager.library_index.exists():
        with open(manager.library_index, 'r', encoding='utf-8') as f:
            library = json.load(f)
        
        # Simple search implementation
        results = []
        query_lower = query.lower()
        
        for shortcut in library.get('shortcuts', []):
            if (query_lower in shortcut.get('title', '').lower() or
                query_lower in shortcut.get('description', '').lower() or
                query_lower in shortcut.get('key_combination_standardized', '').lower() or
                query_lower in shortcut.get('software_name', '').lower()):
                results.append(shortcut)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'query': query,
                'results': results[:50],  # Limit results
                'total_found': len(results)
            })
        }
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Library index not found'})
        }

def get_software_list() -> Dict[str, Any]:
    """Get list of available applications for the sticker app"""
    
    manager = ShortcutLibraryManager()
    
    if manager.library_index.exists():
        with open(manager.library_index, 'r', encoding='utf-8') as f:
            library = json.load(f)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'applications': library.get('applications', {}),
                'platforms': library.get('platforms', []),
                'categories': library.get('categories', []),
                'metadata': library.get('metadata', {})
            })
        }
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Library index not found'})
        }

def download_pdfs_from_s3(bucket_name: str) -> Path:
    """Download all PDFs from S3 bucket to local temp directory"""
    
    s3_client = boto3.client('s3')
    local_folder = Path('/tmp/pdfs')
    local_folder.mkdir(exist_ok=True)
    
    # List all PDF files in bucket
    response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix='', Suffix='.pdf')
    
    for obj in response.get('Contents', []):
        key = obj['Key']
        local_path = local_folder / Path(key).name
        s3_client.download_file(bucket_name, key, str(local_path))
        print(f"   📥 Downloaded: {key}")
    
    return local_folder

def upload_results_to_s3(result, bucket_name: str, original_key: str):
    """Upload extraction results to S3"""
    
    s3_client = boto3.client('s3')
    
    # Create results object
    results_data = {
        'software': result.classification.software_name,
        'platform': result.classification.platform,
        'extraction_date': result.classification.__dict__,
        'shortcuts': [shortcut.__dict__ for shortcut in result.shortcuts],
        'processing_time': result.processing_time,
        'success': result.success
    }
    
    # Upload JSON results
    results_key = f"results/{Path(original_key).stem}_results.json"
    s3_client.put_object(
        Bucket=bucket_name,
        Key=results_key,
        Body=json.dumps(results_data, indent=2),
        ContentType='application/json'
    )
    
    print(f"   📤 Uploaded results: {results_key}")

def upload_batch_results_to_s3(results: List, bucket_name: str):
    """Upload batch extraction results to S3"""
    
    s3_client = boto3.client('s3')
    
    # Create batch summary
    batch_data = {
        'extraction_date': results[0].classification.__dict__ if results else {},
        'total_files': len(results),
        'successful_files': sum(1 for r in results if r.success),
        'total_shortcuts': sum(len(r.shortcuts) for r in results if r.success),
        'results': [
            {
                'software': r.classification.software_name if r.classification else 'unknown',
                'platform': r.classification.platform if r.classification else 'unknown',
                'shortcuts_count': len(r.shortcuts),
                'success': r.success,
                'processing_time': r.processing_time
            }
            for r in results
        ]
    }
    
    # Upload batch summary
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    batch_key = f"batch_results/batch_summary_{timestamp}.json"
    
    s3_client.put_object(
        Bucket=bucket_name,
        Key=batch_key,
        Body=json.dumps(batch_data, indent=2),
        ContentType='application/json'
    )
    
    print(f"   📤 Uploaded batch results: {batch_key}")

# For local testing
if __name__ == "__main__":
    # Test event
    test_event = {
        'eventType': 'scheduled_scan',
        's3_bucket': 'shortcut-pdfs-test'
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))