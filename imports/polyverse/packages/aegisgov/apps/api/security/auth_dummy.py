











"""
Dummy authentication module for development purposes.
In a production system, this would be replaced with proper authentication.
"""

def get_current_user():
    """Return a dummy user for testing"""
    return {"username": "system_agent", "roles": ["admin", "planner"]}

def authenticate_user(username: str, password: str):
    """Dummy authentication function"""
    if username == "admin" and password == "devpassword":
        return get_current_user()
    return None









