from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='api-register'),
    path('login/', views.UserLoginView.as_view(), name='api-login'),
    path('todos/', views.TodoListView.as_view(), name='api-todo-list'),
    path('todos/<int:pk>/', views.TodoDetailView.as_view(), name='api-todo-detail'),
] 