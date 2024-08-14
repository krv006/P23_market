import uuid

from django.contrib.auth.models import AbstractUser
from django.db.models import Model, CharField, DateTimeField, CASCADE, \
    UUIDField, EmailField, IntegerField, SlugField, DecimalField, PositiveIntegerField, TextField, ForeignKey, \
    ManyToManyField, ImageField, TextChoices

from django.utils.text import slugify
from mptt.models import MPTTModel, TreeForeignKey


class CreatedAtBase(Model):
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Base(CreatedAtBase):
    # id = UUIDField(primary_key=True, db_default=RandomUUID(), editable=False) # postgres da ishlatiladi
    id = UUIDField(default=uuid.uuid4, primary_key=True)  # sqlite uchun basic

    class Meta:
        abstract = True


class BaseSlugModel(Model):
    name = CharField(max_length=255)
    slug = SlugField(unique=True)

    class Meta:
        abstract = True

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        self.slug = slugify(self.name)
        while self.__class__.objects.filter(slug=self.slug).exists():
            self.slug += '-1'
        super().save(force_insert, force_update, using, update_fields)

    def __str__(self):
        return self.name


class User(AbstractUser):
    class Role(TextChoices):
        ADMIN = "admin", 'Admin'
        OPERATOR = "operator", 'Operator'
        MANAGER = "manager", 'Manager'
        USER = "user", 'User'

    email = EmailField()
    parol = TextField()
    one_more_parol = TextField()
    address = TextField(null=True, blank=True)
    name = CharField(max_length=255)
    company = CharField(max_length=255)
    phone_number = CharField(max_length=50, null=False, unique=True)
    fax = TextField(null=True, blank=True)
    note = TextField(null=True, blank=True)
    role = CharField(max_length=20, choices=Role.choices, default=Role.USER)

    @property
    def is_operator(self):
        return self.role == self.Role.OPERATOR


class Category(BaseSlugModel, MPTTModel):
    parent = TreeForeignKey('self', on_delete=CASCADE, null=True, blank=True, related_name='children')

    def __str__(self):
        return self.name


class Product(BaseSlugModel, Base):
    price = DecimalField(max_digits=7, decimal_places=2)
    quantity = PositiveIntegerField(default=0)
    description = TextField()
    category = ForeignKey('apps.Category', CASCADE)
    tags = ManyToManyField('apps.Tag', related_name='tag')

    def __str__(self):
        return self.name


class ImageProduct(Model):
    image = ImageField(upload_to='products/%Y/%m/%d/')
    product = ForeignKey('apps.Product', CASCADE, related_name='images')


class Tag(BaseSlugModel):
    pass


class Order(Base):
    class StatusMethod(TextChoices):
        COMPLETED = 'completed', 'Completed'
        PROCESSING = 'processing', 'Processing'
        ON_HOLD = 'on hold', 'On Hold'
        PENDING = 'pending', 'Pending'

    class PaymentMethod(TextChoices):
        UZUM_BANK = 'uzum', 'Uzum'
        CLICK = 'clic', 'Click'
        Payme = 'payme', 'Payme'
        VISA_CARD = 'visa_card', 'Visa_card'
        MASTER_CARD = 'master_card', 'Master_card'

    class Delivery(TextChoices):
        COURIER = 'courier', 'Courier'
        TAKE_AWAY = 'take_away', 'Take_away'

    status = CharField(max_length=255, choices=StatusMethod)
    payment_method = CharField(max_length=255, choices=PaymentMethod)
    delivery = CharField(max_length=255, choices=Delivery)
    address = ForeignKey('apps.Address', CASCADE, related_name='order_address')
    owner = ForeignKey('apps.User', CASCADE, related_name='orders')

    # @property -> bn total amount ni topamiz


class Address(Model):
    full_name = CharField(max_length=255)
    street = CharField(max_length=255)
    zip_code = PositiveIntegerField()
    city = CharField(max_length=255)
    phone = CharField(max_length=255)
    user = ForeignKey('apps.User', CASCADE, related_name='user_address')


class OrderItem(Base):
    product = ForeignKey('apps.Product', CASCADE, related_name='products')
    order = ForeignKey('apps.Order', CASCADE, related_name='order_product')

    # @property -> bn count ni topamiz


class SiteSettings(Model):
    phone_number = IntegerField()
    email = EmailField()
    address = TextField()

# self qoyib qoyish kerak boladi slug da objects.all degan joyda


git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/krv006/P23_market.git
git push -u origin main