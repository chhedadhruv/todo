from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from ..models import Todo
from .serializers import UserSerializer, TodoSerializer
import logging
import time

logger = logging.getLogger(__name__)

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class TodoListView(generics.ListCreateAPIView):
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Todo.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TodoDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Todo.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"Update request received for todo {kwargs.get('pk')} by user {request.user.id}")
            logger.info(f"Request data: {request.data}")
            instance = self.get_object()
            logger.info(f"Found todo instance: {instance.id}")
            
            # Create a copy of the request data
            data = request.data.copy()
            logger.info(f"Processing update with data: {data}")
            
            # If only completed status is being updated
            if len(data) == 1 and 'completed' in data:
                logger.info(f"Updating only completed status to {data['completed']}")
                instance.completed = data['completed']
                instance.save()
                serializer = self.get_serializer(instance)
                logger.info(f"Todo {instance.id} completed status updated successfully")
                return Response(serializer.data)
            
            # For other updates, use the serializer
            logger.info("Using serializer for full update")
            serializer = self.get_serializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            logger.info(f"Todo {instance.id} updated successfully")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating todo: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to update todo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            logger.info(f"Delete request received for todo {kwargs.get('pk')} by user {request.user.id}")
            instance = self.get_object()
            logger.info(f"Found todo instance: {instance.id}")
            
            # Log the todo details before deletion
            logger.info(f"Todo to be deleted - ID: {instance.id}, Title: {instance.title}, User: {instance.user.id}")
            
            self.perform_destroy(instance)
            logger.info(f"Todo {instance.id} deleted successfully")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Todo.DoesNotExist:
            logger.warning(f"Todo not found for deletion request by user {request.user.id}")
            return Response(
                {'error': 'Todo not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting todo: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to delete todo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TodoToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Todo.objects.filter(user=self.request.user)

    def get_object(self, pk):
        try:
            return self.get_queryset().get(pk=pk)
        except Todo.DoesNotExist:
            return None

    def post(self, request, pk):
        logger.info(f"POST request received for todo {pk}")
        return self._toggle_todo(pk)

    def _toggle_todo(self, pk):
        todo = self.get_object(pk)
        if not todo:
            logger.warning(f"Todo {pk} not found")
            return Response(
                {'error': 'Todo not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            logger.info(f"Current completed status: {todo.completed}")
            todo.completed = not todo.completed
            todo.save()
            logger.info(f"New completed status: {todo.completed}")
            serializer = TodoSerializer(todo)
            logger.info(f"Todo {todo.id} toggled successfully")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error toggling todo: {str(e)}")
            return Response(
                {'error': 'Failed to toggle todo. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 