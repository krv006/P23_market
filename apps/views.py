from django.shortcuts import render

from django.views.generic import TemplateView, ListView

from apps.models import Product


class ProductListView(ListView):
    queryset = Product.objects.all()
    template_name = "apps/index.html"
