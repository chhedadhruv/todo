# Django Todo Application

A secure and modern todo application built with Django.

## Features

- User authentication (signup, login, logout)
- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Password reset functionality
- Responsive design with Bootstrap 5
- Secure configuration

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todoproject
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```bash
cp .env.example .env
```
Then edit the `.env` file with your settings:
- Generate a secure SECRET_KEY
- Set your email credentials for password reset
- Configure ALLOWED_HOSTS for your domain

5. Apply database migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

## Security Features

- Environment variables for sensitive data
- Secure password validation
- CSRF protection
- XSS protection
- HSTS enabled
- Secure cookie settings
- SSL/TLS support
- Password reset functionality

## Development

- The application uses Django's built-in development server
- Static files are served using WhiteNoise
- Forms are styled using django-crispy-forms with Bootstrap 5

## Production Deployment

1. Set DEBUG=False in .env
2. Configure proper ALLOWED_HOSTS
3. Set up a proper database (e.g., PostgreSQL)
4. Configure email settings
5. Set up a proper web server (e.g., Nginx)
6. Use Gunicorn as the application server
7. Enable SSL/TLS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 