import hashlib
import os

def get_password_hash(password: str) -> str:
    """
    Generates a secure SHA-256 hash of a password with a unique salt.
    """
    salt = os.urandom(16).hex()
    # Combine password and salt, then hash
    hash_obj = hashlib.sha256((password + salt).encode('utf-8'))
    password_hash = hash_obj.hexdigest()
    # Store salt and hash separated by a colon
    return f"{salt}:{password_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against the stored salt:hash combination.
    """
    try:
        salt, stored_hash = hashed_password.split(":")
        hash_obj = hashlib.sha256((plain_password + salt).encode('utf-8'))
        return hash_obj.hexdigest() == stored_hash
    except ValueError:
        return False
