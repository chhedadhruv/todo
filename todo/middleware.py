import logging
import time
from django.http import HttpResponseServerError

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request details
        start_time = time.time()
        logger.info(f"Request: {request.method} {request.path}")
        logger.info(f"Headers: {dict(request.headers)}")
        if request.body:
            logger.info(f"Body: {request.body.decode('utf-8')}")

        # Process the request
        response = self.get_response(request)

        # Log response details
        duration = time.time() - start_time
        logger.info(f"Response: {response.status_code} (took {duration:.2f}s)")
        logger.info(f"Response Headers: {dict(response.headers)}")
        
        if hasattr(response, 'data'):
            logger.info(f"Response Data: {response.data}")

        return response

    def process_exception(self, request, exception):
        logger.error(f"Exception occurred: {str(exception)}", exc_info=True)
        return HttpResponseServerError() 