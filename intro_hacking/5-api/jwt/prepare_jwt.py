import base64
import hmac
import hashlib
import json
import time # Used for dynamic timestamp calculation
from typing import Dict, Any

# --- Helper function for Base64Url Encoding ---
def base64url_encode(data: bytes) -> str:
    """Encodes bytes to Base64Url string (URL-safe, no padding)."""
    encoded = base64.urlsafe_b64encode(data).decode('utf-8')
    # Remove any trailing '=' padding for JWT format
    return encoded.rstrip('=')

# --- Main JWT Signature Calculation Function ---
def create_jwt_signature(header: Dict[str, Any], payload: Dict[str, Any], secret: str) -> str:
    """
    Calculates and returns the full signed JWT string.

    Args:
        header: The clear-text JWT header dictionary.
        payload: The clear-text JWT payload dictionary (must contain iat/exp claims).
        secret: The secret key used for signing.

    Returns:
        The complete JWT string (Header.Payload.Signature).
    """
    
    # 1. JSON Serialization (Minified)
    header_json = json.dumps(header, separators=(',', ':'))
    payload_json = json.dumps(payload, separators=(',', ':'))
    
    # 2. Base64Url Encoding
    header_b64url = base64url_encode(header_json.encode('utf-8'))
    payload_b64url = base64url_encode(payload_json.encode('utf-8'))
    
    # 3. Prepare the Signing Input
    signing_input = f"{header_b64url}.{payload_b64url}"
    data_bytes = signing_input.encode('utf-8')
    key_bytes = secret.encode('utf-8')

    # 4. Calculate the Signature (HMAC SHA-256)
    signature_bytes = hmac.new(
        key_bytes, 
        data_bytes, 
        hashlib.sha256
    ).digest()

    # 5. Base64Url Encode the Signature
    signature_b64url = base64url_encode(signature_bytes)

    # 6. Assemble the Final JWT
    final_jwt = f"{signing_input}.{signature_b64url}"
    
    # Print components for verification
    print("--- JWT Components ---")
    print(f"Header (B64Url):  {header_b64url}")
    print(f"Payload (B64Url): {payload_b64url}")
    print(f"Signing Input:    {signing_input}")
    print(f"Signature (B64Url): {signature_b64url}")
    
    return final_jwt

# =========================================================
# 💡 Usage Example: Dynamic Timestamp Calculation
# =========================================================

# Define the constants for the token
INPUT_SECRET = "random" # Note the trailing space
EXPIRATION_SECONDS = 3600 # 1 hour

# 1. Dynamic Claims Generation
current_time = int(time.time())
issued_at = current_time 
expires_at = current_time + EXPIRATION_SECONDS

# 2. Define Inputs (No Hardcoded Timestamps)
input_header = {"alg": "HS256", "typ": "JWT"}
input_payload = {
    "exp": expires_at,       # Dynamic Expiration Time
    "iat": issued_at,        # Dynamic Issued At Time
    "sub": "admin"
}

# Print dynamic times for clarity
print("--- Dynamic Time Claims ---")
print(f"Issued At (iat): {issued_at} ({time.ctime(issued_at)})")
print(f"Expires At (exp): {expires_at} ({time.ctime(expires_at)})")
print("-" * 50)

# Calculate the JWT
signed_jwt = create_jwt_signature(input_header, input_payload, INPUT_SECRET)

print("\n" + "=" * 50)
print(f"**Calculated JWT**:\n{signed_jwt}")
print("=" * 50)