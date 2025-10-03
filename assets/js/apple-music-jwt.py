#!/usr/bin/env python3
"""
Apple Music JWT Token Generator
Generates properly formatted JWT tokens for Apple Music API authentication
"""

import jwt
import time
import json
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
import requests


class AppleMusicJWT:
    """Apple Music JWT token generator with proper ES256 signing"""
    
    def __init__(self, team_id, key_id, private_key_path=None, private_key_content=None):
        """
        Initialize Apple Music JWT generator
        
        Args:
            team_id (str): 10-character Team ID from Apple Developer account
            key_id (str): 10-character Key ID from MusicKit private key
            private_key_path (str): Path to .p8 private key file
            private_key_content (str): Private key content as string
        """
        self.team_id = team_id
        self.key_id = key_id
        
        if private_key_path:
            with open(private_key_path, 'r') as f:
                self.private_key = f.read()
        elif private_key_content:
            self.private_key = private_key_content
        else:
            raise ValueError("Either private_key_path or private_key_content must be provided")
        
        self._validate_inputs()
    
    def _validate_inputs(self):
        """Validate required inputs"""
        if not self.team_id or len(self.team_id) != 10:
            raise ValueError("Team ID must be exactly 10 characters")
        
        if not self.key_id or len(self.key_id) != 10:
            raise ValueError("Key ID must be exactly 10 characters")
        
        if not self.private_key:
            raise ValueError("Private key is required")
    
    def generate_token(self, expiration_hours=24, origins=None):
        """
        Generate a properly formatted JWT token for Apple Music API
        
        Args:
            expiration_hours (int): Token expiration in hours (default: 24, max: 4320 = 6 months)
            origins (list): Optional list of allowed origins for web apps
            
        Returns:
            str: JWT token
        """
        # Calculate timestamps
        now = int(time.time())
        max_expiration = now + 15777000  # 6 months max per Apple
        requested_expiration = now + (expiration_hours * 3600)
        expiration = min(requested_expiration, max_expiration)
        
        # JWT Header - MUST use ES256 algorithm
        headers = {
            "alg": "ES256",     # Required: ECDSA using P-256 and SHA-256
            "kid": self.key_id  # Required: 10-character Key ID
        }
        
        # JWT Payload (Claims)
        payload = {
            "iss": self.team_id,  # Required: 10-character Team ID
            "iat": now,           # Required: Issued at time (Unix timestamp)
            "exp": expiration     # Required: Expiration time (Unix timestamp)
        }
        
        # Add origin claim for web applications (optional but recommended)
        if origins and isinstance(origins, list) and len(origins) > 0:
            payload["origin"] = origins
        
        try:
            # Generate the token using PyJWT with ES256 algorithm
            token = jwt.encode(
                payload=payload,
                key=self.private_key,
                algorithm="ES256",
                headers=headers
            )
            
            return token
        except Exception as e:
            raise Exception(f"Failed to generate JWT token: {str(e)}")
    
    def validate_token_format(self, token):
        """
        Validate token format and claims without verifying signature
        
        Args:
            token (str): JWT token to validate
            
        Returns:
            dict: Decoded token information
        """
        try:
            # Decode without verification to check format
            header = jwt.get_unverified_header(token)
            payload = jwt.decode(token, options={"verify_signature": False})
            
            # Validate required fields
            if header.get('alg') != 'ES256':
                raise ValueError("Invalid algorithm: must be ES256")
            
            if not header.get('kid') or len(header.get('kid')) != 10:
                raise ValueError("Invalid Key ID: must be 10 characters")
            
            if not payload.get('iss') or len(payload.get('iss')) != 10:
                raise ValueError("Invalid Team ID: must be 10 characters")
            
            if not payload.get('iat') or not payload.get('exp'):
                raise ValueError("Missing required claims: iat and exp are required")
            
            now = int(time.time())
            if payload.get('exp') <= now:
                raise ValueError("Token has expired")
            
            if payload.get('iat') > now + 60:  # Allow 60 seconds clock skew
                raise ValueError("Token issued in the future")
            
            return {
                'header': header,
                'payload': payload,
                'is_valid': True,
                'expires_at': datetime.fromtimestamp(payload.get('exp')),
                'issued_at': datetime.fromtimestamp(payload.get('iat'))
            }
        except Exception as e:
            raise ValueError(f"Token validation failed: {str(e)}")


class AppleMusicAuth:
    """Helper class for Apple Music API authentication"""
    
    @staticmethod
    def create_token(team_id, key_id, private_key_path=None, private_key_content=None, **options):
        """
        Create a new JWT token for Apple Music API
        
        Args:
            team_id (str): 10-character Team ID
            key_id (str): 10-character Key ID
            private_key_path (str): Path to private key file
            private_key_content (str): Private key content
            **options: Additional options (expiration_hours, origins)
            
        Returns:
            str: JWT token
        """
        jwt_generator = AppleMusicJWT(
            team_id=team_id,
            key_id=key_id,
            private_key_path=private_key_path,
            private_key_content=private_key_content
        )
        
        return jwt_generator.generate_token(
            expiration_hours=options.get('expiration_hours', 24),
            origins=options.get('origins')
        )
    
    @staticmethod
    def test_connection(token):
        """
        Test Apple Music API connection with generated token
        
        Args:
            token (str): JWT token
            
        Returns:
            dict: API response
        """
        try:
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            # Test with a simple catalog request
            response = requests.get(
                'https://api.music.apple.com/v1/catalog/us/songs/203709340',
                headers=headers,
                timeout=10
            )
            
            if not response.ok:
                raise Exception(f"API request failed: {response.status_code} - {response.text}")
            
            return response.json()
        except Exception as e:
            raise Exception(f"Connection test failed: {str(e)}")


def main():
    """Example usage and testing"""
    import os
    
    # Example configuration (replace with your actual values)
    TEAM_ID = os.getenv('APPLE_TEAM_ID', 'YOUR_TEAM_ID')  # 10 characters
    KEY_ID = os.getenv('APPLE_KEY_ID', 'YOUR_KEY_ID')     # 10 characters
    PRIVATE_KEY_PATH = os.getenv('APPLE_PRIVATE_KEY_PATH', 'path/to/your/AuthKey_XXXXXXXXXX.p8')
    
    try:
        # Generate token
        print("Generating Apple Music JWT token...")
        token = AppleMusicAuth.create_token(
            team_id=TEAM_ID,
            key_id=KEY_ID,
            private_key_path=PRIVATE_KEY_PATH,
            expiration_hours=24,
            origins=['https://yourdomain.com']  # Optional for web apps
        )
        
        print(f"✅ Token generated successfully!")
        print(f"Token length: {len(token)} characters")
        print(f"Token: {token[:50]}...")
        
        # Validate token format
        jwt_generator = AppleMusicJWT(TEAM_ID, KEY_ID, private_key_path=PRIVATE_KEY_PATH)
        token_info = jwt_generator.validate_token_format(token)
        print(f"✅ Token validation passed!")
        print(f"Expires at: {token_info['expires_at']}")
        print(f"Issued at: {token_info['issued_at']}")
        
        # Test API connection
        print("\nTesting Apple Music API connection...")
        result = AppleMusicAuth.test_connection(token)
        print(f"✅ API connection successful!")
        print(f"Test song: {result.get('data', [{}])[0].get('attributes', {}).get('name', 'Unknown')}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())