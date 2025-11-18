import base64
import hmac
import hashlib
import json

# --- Helper function for Base64Url Encoding ---
def base64url_encode(data):
    """Encodes bytes to Base64Url string (URL-safe, no padding)."""
    if isinstance(data, str):
        data = data.encode('utf-8')
        
    encoded = base64.urlsafe_b64encode(data).decode('utf-8')
    # Remove any trailing '=' padding for JWT format
    return encoded.rstrip('=')

# 1. Define the Input Components (Clear Text)
# NOTE: These must be valid JSON objects (Python dictionaries)
header = {"alg": "HS256", "typ": "JWT"}
payload = {"exp": 1763475091, "iat": 1763475031, "sub": "admin"}
secret = "random" # Includes the trailing space

# 2. JSON Serialization and Base64Url Encoding
# JWT requires components to be minified (no spaces) and then Base64Url encoded.
header_json = json.dumps(header, separators=(',', ':'))
payload_json = json.dumps(payload, separators=(',', ':'))

header_b64url = base64url_encode(header_json)
payload_b64url = base64url_encode(payload_json)

# 3. Prepare the Signing Input
# The input for the hash function is the concatenation of the encoded header 
# and encoded payload, separated by a period.
signing_input = f"{header_b64url}.{payload_b64url}"
key_bytes = secret.encode('utf-8')
data_bytes = signing_input.encode('utf-8')

# 4. Calculate the Signature (HMAC SHA-256)
signature_bytes = hmac.new(
    key_bytes, 
    data_bytes, 
    hashlib.sha256
).digest()

# 5. Base64Url Encode the Signature
signature_b64url = base64url_encode(signature_bytes)

# 6. Assemble and Print the Final JWT
final_jwt = f"{header_b64url}.{payload_b64url}.{signature_b64url}"

# --- Output ---
print(f"Header (B64Url): {header_b64url}")
print(f"Payload (B64Url): {payload_b64url}")
print(f"Signature (B64Url): {signature_b64url}")
print("-" * 50)
print(f"Complete JWT: {final_jwt}")