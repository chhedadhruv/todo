from corsheaders.defaults import default_headers, default_methods
import os

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins in development
CORS_ALLOW_CREDENTIALS = True

# Parse CORS_ORIGIN_WHITELIST from environment variable
CORS_ORIGIN_WHITELIST = [
    origin.strip() for origin in 
    os.getenv('CORS_ORIGIN_WHITELIST', '').split(',')
    if origin.strip()
]

# Allow all methods by default
CORS_ALLOW_METHODS = list(default_methods)

# Allow all headers by default
CORS_ALLOW_HEADERS = list(default_headers)

# Expose all headers
CORS_EXPOSE_HEADERS = ['*']

# CORS preflight max age
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours 