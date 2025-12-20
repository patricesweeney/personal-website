"""
Supabase client for Modal functions.

Uses service role key to bypass RLS (intentional for backend processing).
"""

import os
from supabase import create_client, Client


def get_supabase_client() -> Client:
    """
    Create a Supabase client with service role credentials.
    
    Must be called from within a Modal function with supabase-secrets attached.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. "
            "Ensure the function has secrets=[modal.Secret.from_name('supabase-secrets')]"
        )
    
    return create_client(url, key)

