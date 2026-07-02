import os
from typing import Optional
from supabase import create_client, Client

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """
    Lazy initialization of the Supabase Client.
    Prevents application startup crashes if credentials are not yet configured.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_KEY environment variables must be configured "
            "to perform database persistence operations."
        )

    _supabase_client = create_client(supabase_url, supabase_key)
    return _supabase_client
