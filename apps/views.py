from django.shortcuts import render

from django.views.generic import TemplateView, ListView

from apps.models import Product, Category


class CategoryListView(ListView):
    queryset = Category.objects.all()
    template_name = "apps/product/index.html"


class ProductListView(ListView):
    queryset = Product.objects.all()
    template_name = "apps/product/index.html"


class ProductTemplateView(TemplateView):
    queryset = Product.objects.all()
    template_name = "apps/product/main.html"
