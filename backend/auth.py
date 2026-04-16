import jwt
import hashlib
from datetime import datetime, timedelta
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# ============================================================
# Admin Credentials Stored Natively in Python
# ============================================================
# Change these values to set the admin lock!
ADMIN_USERNAME = "admin"
# This is the SHA-256 hash of the password "admin123"
# You can generate new hashes using hashlib.sha256(b"yourpass").hexdigest()
ADMIN_PASSWORD_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" 

# Security tokens
JWT_SECRET = "super_secret_intentpulse_key_2026_x"
ALGORITHM = "HS256"
security = HTTPBearer()

def verify_password(plain_password: str) -> bool:
    """Verifies a plain password against the stored SHA-256 hash."""
    hashed = hashlib.sha256(plain_password.encode()).hexdigest()
    return hashed == ADMIN_PASSWORD_HASH

def create_access_token() -> str:
    """Generates a 24-hour JSON Web Token for the admin."""
    expiration = datetime.utcnow() + timedelta(hours=24)
    payload = {
        "sub": ADMIN_USERNAME,
        "exp": expiration
    }
    encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Dependency that intercepts requests and validates the JWT token.
    Throws 401 Unauthorized if token is missing, invalid, or expired.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("sub") != ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Invalid User")
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
