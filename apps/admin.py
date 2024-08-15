from django.contrib import admin
from mptt.admin import DraggableMPTTAdmin

from .models import Order, Product, Category, User, OrderItem, Address, ImageProduct, Tag, SiteSettings


@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin):
    exclude = 'slug',


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    pass


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    pass


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    exclude = 'slug',


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    pass


@admin.register(ImageProduct)
class ImageProductAdmin(admin.ModelAdmin):
    pass


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    exclude = 'slug',


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    pass
