#!/usr/bin/env python3
"""
AI Shortcut Validator - Uses AI to validate potentially malformed shortcuts
Only validates shortcuts that are flagged as suspicious by pattern matching
"""
import json
import time
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import boto3
from pathlib import Path

@dataclass
class ValidationResult:
    """Result of AI validation for a shortcut"""
    is_valid: bool
    confidence: float
    reason: str
    suggested_correction: Optional[str] = None

class AIShortcutValidator:
    """Uses AI to validate suspicious shortcuts"""
    
    def __init__(self, aws_region: str = "us-east-1", aws_profile: Optional[str] = None):
        self.aws_region = aws_region
        self.aws_profile = aws_profile
        
        # Initialize AWS session
        if aws_profile:
            session = boto3.Session(profile_name=aws_profile)
            self.bedrock = session.client('bedrock-runtime', region_name=aws_region)
        else:
            self.bedrock = boto3.client('bedrock-runtime', region_name=aws_region)
        
        # Cache for validation results to avoid duplicate API calls
        self.validation_cache = {}
    
    def validate_malformed_shortcuts(self, malformed_shortcuts: List[Dict]) -> List[Dict]:
        """Validate a list of potentially malformed shortcuts using AI"""
        
        print(f"🤖 AI validating {len(malformed_shortcuts)} potentially malformed shortcuts...")
        
        validated_shortcuts = []
        
        # Group by application for more efficient validation
        app_groups = {}
        for shortcut in malformed_shortcuts:
            app_name = shortcut.get('application', 'unknown')
            if app_name not in app_groups:
                app_groups[app_name] = []
            app_groups[app_name].append(shortcut)
        
        for app_name, app_shortcuts in app_groups.items():
            print(f"   🔍 Validating {len(app_shortcuts)} shortcuts for {app_name}...")
            
            # Validate in batches for efficiency
            batch_size = 10
            for i in range(0, len(app_shortcuts), batch_size):
                batch = app_shortcuts[i:i + batch_size]
                validated_batch = self._validate_shortcut_batch(app_name, batch)
                validated_shortcuts.extend(validated_batch)
                
                # Small delay to avoid rate limiting
                time.sleep(0.5)
        
        return validated_shortcuts
    
    def _validate_shortcut_batch(self, app_name: str, shortcuts: List[Dict]) -> List[Dict]:
        """Validate a batch of shortcuts for a specific application"""
        
        # Create cache key for this batch
        cache_key = f"{app_name}_{len(shortcuts)}_{hash(str(sorted([s['key_combination'] for s in shortcuts])))}"
        
        if cache_key in self.validation_cache:
            return self.validation_cache[cache_key]
        
        # Prepare shortcuts for AI analysis
        shortcut_list = []
        for shortcut in shortcuts:
            shortcut_info = {
                'key': shortcut.get('key_combination', ''),
                'title': shortcut.get('title', ''),
                'description': shortcut.get('description', '')
            }
            shortcut_list.append(shortcut_info)
        
        # Create AI prompt
        prompt = self._create_validation_prompt(app_name, shortcut_list)
        
        try:
            # Call Claude AI
            response = self._call_claude_ai(prompt)
            
            # Parse AI response
            validation_results = self._parse_validation_response(response)
            
            # Combine original shortcuts with validation results
            validated_shortcuts = []
            for i, shortcut in enumerate(shortcuts):
                validation = validation_results.get(i, ValidationResult(
                    is_valid=False, confidence=0.5, reason="AI validation failed"
                ))
                
                validated_shortcut = shortcut.copy()
                validated_shortcut.update({
                    'ai_validated': True,
                    'is_valid': validation.is_valid,
                    'validation_confidence': validation.confidence,
                    'validation_reason': validation.reason,
                    'suggested_correction': validation.suggested_correction
                })
                validated_shortcuts.append(validated_shortcut)
            
            # Cache results
            self.validation_cache[cache_key] = validated_shortcuts
            
            return validated_shortcuts
            
        except Exception as e:
            print(f"   ❌ AI validation failed for {app_name}: {e}")
            
            # Return original shortcuts with validation failure flag
            validated_shortcuts = []
            for shortcut in shortcuts:
                validated_shortcut = shortcut.copy()
                validated_shortcut.update({
                    'ai_validated': False,
                    'is_valid': False,
                    'validation_confidence': 0.0,
                    'validation_reason': f"AI validation error: {str(e)}",
                    'suggested_correction': None
                })
                validated_shortcuts.append(validated_shortcut)
            
            return validated_shortcuts
    
    def _create_validation_prompt(self, app_name: str, shortcuts: List[Dict]) -> str:
        """Create AI prompt for shortcut validation"""
        
        prompt = f"""You are a keyboard shortcut expert. I need you to validate whether these extracted shortcuts for {app_name} are legitimate or malformed.

Application: {app_name}

Shortcuts to validate:
"""
        
        for i, shortcut in enumerate(shortcuts):
            prompt += f"{i}. Key: '{shortcut['key']}' | Title: '{shortcut['title']}' | Description: '{shortcut['description']}'\n"
        
        prompt += f"""
Please analyze each shortcut and determine:
1. Is this a valid keyboard shortcut for {app_name}?
2. What's your confidence level (0.0 to 1.0)?
3. Why is it valid or invalid?
4. If invalid, what might be the correct shortcut?

Consider that:
- Some apps like Vim have single-letter shortcuts (j, k, h, l, etc.)
- Some shortcuts might be function keys (F1, F2, etc.)
- Some might be special keys (Home, End, Delete, etc.)
- Timestamps, dates, or random symbols are likely extraction errors
- Incomplete shortcuts with just "+" or partial key combinations are likely malformed

Respond in JSON format:
{{
  "0": {{"is_valid": true/false, "confidence": 0.0-1.0, "reason": "explanation", "suggested_correction": "corrected shortcut or null"}},
  "1": {{"is_valid": true/false, "confidence": 0.0-1.0, "reason": "explanation", "suggested_correction": "corrected shortcut or null"}},
  ...
}}
"""
        
        return prompt
    
    def _call_claude_ai(self, prompt: str) -> str:
        """Call Claude AI via AWS Bedrock"""
        
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
        
        response = self.bedrock.invoke_model(
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            body=body,
            contentType="application/json"
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['content'][0]['text']
    
    def _parse_validation_response(self, response: str) -> Dict[int, ValidationResult]:
        """Parse AI validation response"""
        
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in response")
            
            json_str = response[json_start:json_end]
            validation_data = json.loads(json_str)
            
            results = {}
            for key, data in validation_data.items():
                try:
                    index = int(key)
                    results[index] = ValidationResult(
                        is_valid=data.get('is_valid', False),
                        confidence=float(data.get('confidence', 0.0)),
                        reason=data.get('reason', 'No reason provided'),
                        suggested_correction=data.get('suggested_correction')
                    )
                except (ValueError, KeyError) as e:
                    print(f"   ⚠️  Error parsing validation result for key {key}: {e}")
            
            return results
            
        except Exception as e:
            print(f"   ❌ Error parsing AI response: {e}")
            return {}
    
    def is_available(self) -> bool:
        """Check if AI validation is available"""
        try:
            # Test with a simple call
            test_prompt = "Test prompt"
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 10,
                "messages": [{"role": "user", "content": test_prompt}]
            })
            
            self.bedrock.invoke_model(
                modelId="anthropic.claude-3-haiku-20240307-v1:0",
                body=body,
                contentType="application/json"
            )
            return True
        except Exception:
            return False

def main():
    """Test the AI shortcut validator"""
    
    # Test with some sample malformed shortcuts
    test_shortcuts = [
        {
            'application': 'vim',
            'key_combination': 'j',
            'title': 'Move cursor down',
            'description': 'Move cursor down one line'
        },
        {
            'application': 'vim',
            'key_combination': ':38 / :38',
            'title': '/10/26, 12 PM',
            'description': '/10/26, 12 PM'
        },
        {
            'application': 'kiro',
            'key_combination': '⌥',
            'title': '+/',
            'description': '+/'
        },
        {
            'application': 'rstudio',
            'key_combination': 'Home',
            'title': 'Move cursor to beginning of line',
            'description': 'Move cursor to beginning of line'
        }
    ]
    
    print("🧪 Testing AI Shortcut Validator")
    
    try:
        validator = AIShortcutValidator(aws_profile='developer playground')
        
        if not validator.is_available():
            print("❌ AI validation not available")
            return
        
        validated = validator.validate_malformed_shortcuts(test_shortcuts)
        
        print(f"\n📊 Validation Results:")
        for shortcut in validated:
            status = "✅ VALID" if shortcut['is_valid'] else "❌ INVALID"
            confidence = shortcut['validation_confidence']
            reason = shortcut['validation_reason']
            
            print(f"   {status} ({confidence:.1%}): {shortcut['key_combination']} → {shortcut['title']}")
            print(f"      Reason: {reason}")
            if shortcut.get('suggested_correction'):
                print(f"      Suggestion: {shortcut['suggested_correction']}")
            print()
    
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    main()