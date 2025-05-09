from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='api-register'),
    path('login/', views.UserLoginView.as_view(), name='api-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('todos/', views.TodoListView.as_view(), name='api-todo-list'),
    path('todos/<int:pk>/', views.TodoDetailView.as_view(), name='api-todo-detail'),
    path('todos/<int:pk>/toggle/', views.TodoToggleView.as_view(), name='api-todo-toggle'),
] 