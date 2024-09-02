# Django settings for transcendence project.

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get( "SECRET_KEY" )

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get( "DEBUG", "True" ) == "True"

ALLOWED_HOSTS = os.environ.get( "ALLOWED_HOSTS" ).split( "," )


# Application definition

INSTALLED_APPS = [
	'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
	'channels',
	'app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'transcendence.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'transcendence.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': os.environ.get( "DB_ENGINE" ),
        'NAME': os.environ.get( "DB_NAME" ),
		'USER': os.environ.get( "DB_USER" ),
		'PASSWORD': os.environ.get( "DB_PASSWORD" ),
		'HOST': os.environ.get( "DB_HOST" ),
		'PORT': os.environ.get( "PORT" ),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_ROOT = os.environ.get( "STATIC_ROOT" )
STATIC_URL = os.environ.get( "STATIC_URL" )
MEDIA_ROOT = os.path.join( BASE_DIR, "media" )
MEDIA_URL = os.environ.get( "MEDIA_URL" )

DOMAIN = os.environ.get( "DOMAIN" )
DOMAIN_URL = os.environ.get( "DOMAIN_URL" )
CSRF_TRUSTED_ORIGINS = [DOMAIN_URL]

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email configuration

DEFAULT_FROM_EMAIL = os.environ.get( "DEFAULT_FROM_EMAIL" )
EMAIL_USE_TLS = os.environ.get( "EMAIL_USE_TLS" )
EMAIL_USE_SSL = os.environ.get( "EMAIL_USE_SSL" )
EMAIL_HOST = os.environ.get( "EMAIL_HOST" )
EMAIL_PORT = os.environ.get( "EMAIL_PORT" )
EMAIL_HOST_USER = os.environ.get( "EMAIL_HOST_USER" )
EMAIL_HOST_PASSWORD = os.environ.get( "EMAIL_HOST_PASSWORD" )

CHANNEL_LAYERS = {
		"default": {
			"BACKEND": "channels_redis.core.RedisChannelLayer",
			"CONFIG": {
				"hosts": [( os.environ.get( "REDIS_HOST" ), os.environ.get( "REDIS_PORT") )],
				},
			},
		}

ASGI_APPLICATION = 'transcendence.asgi.application'

LOGIN_REDIRECT_URL = 'profile'
LOGIN_URL = 'login'
LOGOUT_URL = 'logout'
