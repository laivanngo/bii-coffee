from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# 1. Bảng Nguyên liệu (Vd: Sữa tươi, Cafe hạt, Ly nhựa)
class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # Tên nguyên liệu
    unit = Column(String) # Đơn vị tính (g, ml, cái)
    
    # Quan hệ ngược lại với Recipe
    recipes = relationship("Recipe", back_populates="ingredient")

# 2. Bảng Danh mục (Vd: Cafe, Trà sữa, Đá xay)
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    
    products = relationship("Product", back_populates="category")

# 3. Bảng Sản phẩm bán (Vd: Latte Đá, Cappuccino)
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Integer) # Giá bán (VND)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True) # Còn bán hay không
    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="products")
    # Một sản phẩm có nhiều dòng công thức
    recipes = relationship("Recipe", back_populates="product")

# 4. Bảng Công thức (Bí mật kinh doanh: 1 Latte = bao nhiêu sữa?)
class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    amount = Column(Float) # Số lượng cần dùng (Vd: 200)

    product = relationship("Product", back_populates="recipes")
    ingredient = relationship("Ingredient", back_populates="recipes")

# 5. Bảng Cửa hàng (Chi nhánh)
class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    address = Column(String)
    
    # Mỗi cửa hàng có một kho riêng
    inventory = relationship("StoreInventory", back_populates="store")

# 6. Bảng Kho hàng từng quán (Quán A còn bao nhiêu Sữa?)
class StoreInventory(Base):
    __tablename__ = "store_inventory"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    stock_quantity = Column(Float, default=0) # Số lượng tồn kho thực tế

    store = relationship("Store", back_populates="inventory")
    ingredient = relationship("Ingredient")