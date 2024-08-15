from django.urls import path
from .views import ProductListView, ProductTemplateView

urlpatterns = [
    path('', ProductListView.as_view(), name='index'),
    path('main/page', ProductTemplateView.as_view(), name='main_page'),
]
