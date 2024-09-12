from django import urls
from django.contrib import auth
from django.contrib import messages
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import redirect
from django.views import generic

from . import forms
from . import models
from .providers import fortytwo

# https://django-advanced-training.readthedocs.io/en/latest/features/class-based-views/

class HomepageView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/home.html"
		return ( context )

class LoginView ( auth_views.LoginView ):
	redirect_authenticated_user = True
	template_name = "app/base.html"
	# settings.py: next_page = "/profile"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/login.html"
		context["form"] = forms.LoginForm()
		context['provider_42_login'] = fortytwo.get_login_url( "42", 
				{"state": self.request.COOKIES.get( 'csrftoken' ) } )
		return ( context )

def do_provider_login ( request ):
	csrf = request.COOKIES.get( 'csrftoken', None )
	# if csrf is None... abort
	state = request.GET.get( 'state', None )
	# if state is None... abort
	code = request.GET.get( 'code', None )

	# If the states don't match the process should be aborted.
	if csrf != state:
		return ( redirect( 'login' ) )

	# auth logic here...
	print( f"code: {code}" )
	token = fortytwo.get_token( "42", { "code": code, "state": csrf } )
	print( f"token: {token}" )
	return ( LoginView.as_view()( request ) )

@login_required
def do_logout ( request ):
	auth.logout( request )
	messages.success( request, "proper logout" )
	return redirect( 'home' )

class LogoutView ( auth_views.LogoutView ):
	http_method_names = ["post", "get"]
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/logout.html"
		return ( context )

	def get ( self, request, *args, **kwargs ):
		auth.logout( request )
		redirect_to = self.get_success_url()
		if redirect_to != request.get_full_path():
			return ( HttpResponseRedirect( redirect_to ) )
		return ( super().get( request, *args, **kwargs ) )

class SignupView ( generic.CreateView ):
  form_class = auth.forms.UserCreationForm
  success_url = urls.reverse_lazy( 'login' )
  template_name = "app/base.html"

  def get_context_data ( self, **kwargs ):
	  context = super().get_context_data( **kwargs )
	  context["page"] = "app/pages/signup.html"
	  context["form"] = forms.SignupForm()
	  return ( context )

@login_required
def profile_dashboard ( request ):
	return ( render( request, 'app/pages/base.html', {'page': 'app/pages/profile.html'} ) )

class ProfileView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/profile.html"
		return ( context )

class TournamentView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/tournament.html"
		return ( context )

class PlayView ( generic.TemplateView ):
	template_name = "app/base.html"

	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/tournament.html"
		return ( context )

class GameView ( generic.TemplateView ):
	template_name = "app/pages/pong.html"
	
	def get_context_data ( self, **kwargs ):
		context = super().get_context_data( **kwargs )
		context["page"] = "app/pages/pong.html"
		return ( context )

##

def double_play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		"page": "app/pages/double_play.html",
    }
    return ( render( request, 'app/base.html', context) )

def solo_play_view ( request ):

	context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		"page": "app/pages/solo_play.html",
    }
	return ( render( request, 'app/base.html', context ) )

def play_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		"page": "app/pages/play.html",
    }
    return ( render ( request, 'app/base.html', context ) )

def pong_view ( request ):
    context = {
		"title":"P4ngP2ong",
		"lang":"en",
        "username": "clara",
		"page": "app/pages/pong.html",
    }
    return ( render( request, 'app/base.html', context ) )
