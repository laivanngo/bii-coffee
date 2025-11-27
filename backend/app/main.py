from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin, ModelView
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json
from .database import engine, Base, get_db
from .models import Ingredient, Product, Category, Recipe, Store, StoreInventory

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Luckin Clone API", version="1.0.0")

# --- CẤU HÌNH CORS ---
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- QUẢN LÝ WEBSOCKET (ĐƯỜNG DÂY NÓNG) ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Gửi tin nhắn cho tất cả màn hình đang mở
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

# --- ADMIN (GIỮ NGUYÊN) ---
class IngredientAdmin(ModelView, model=Ingredient):
    column_list = [Ingredient.id, Ingredient.name, Ingredient.unit]
class CategoryAdmin(ModelView, model=Category):
    column_list = [Category.id, Category.name]
class ProductAdmin(ModelView, model=Product):
    column_list = [Product.id, Product.name, Product.price]
class RecipeAdmin(ModelView, model=Recipe):
    column_list = [Recipe.product, Recipe.ingredient, Recipe.amount]
class StoreAdmin(ModelView, model=Store):
    column_list = [Store.id, Store.name]
class InventoryAdmin(ModelView, model=StoreInventory):
    column_list = [StoreInventory.store, StoreInventory.ingredient, StoreInventory.stock_quantity]

admin = Admin(app, engine)
admin.add_view(IngredientAdmin)
admin.add_view(CategoryAdmin)
admin.add_view(ProductAdmin)
admin.add_view(RecipeAdmin)
admin.add_view(StoreAdmin)
admin.add_view(InventoryAdmin)

# --- API ---

class OrderRequest(BaseModel):
    store_id: int
    product_id: int
    quantity: int = 1

@app.get("/menu")
def get_menu(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_active == True).all()
    return products

@app.post("/order")
async def create_order(order: OrderRequest, db: Session = Depends(get_db)): # Lưu ý: thêm async
    store = db.query(Store).filter(Store.id == order.store_id).first()
    product = db.query(Product).filter(Product.id == order.product_id).first()
    
    if not store or not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy Cửa hàng hoặc Sản phẩm")

    recipes = db.query(Recipe).filter(Recipe.product_id == product.id).all()
    if not recipes:
        raise HTTPException(status_code=400, detail="Món này chưa có công thức!")

    # Check kho
    for recipe in recipes:
        required_amount = recipe.amount * order.quantity
        inventory_item = db.query(StoreInventory).filter(
            StoreInventory.store_id == store.id,
            StoreInventory.ingredient_id == recipe.ingredient.id
        ).first()

        if not inventory_item or inventory_item.stock_quantity < required_amount:
            raise HTTPException(status_code=400, detail=f"Hết hàng: {recipe.ingredient.name}")

    # Trừ kho
    for recipe in recipes:
        required_amount = recipe.amount * order.quantity
        inventory_item = db.query(StoreInventory).filter(
            StoreInventory.store_id == store.id,
            StoreInventory.ingredient_id == recipe.ingredient.id
        ).first()
        inventory_item.stock_quantity -= required_amount

    db.commit()

    # --- BẮN TIN CHO BẾP ---
    await manager.broadcast({
        "type": "NEW_ORDER",
        "product": product.name,
        "quantity": order.quantity,
        "store": store.name,
        "time": "Vừa xong"
    })

    return {"message": "Thành công", "product": product.name}

# --- ENDPOINT CHO BẾP KẾT NỐI ---
@app.websocket("/ws/kitchen")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Giữ kết nối luôn mở
    except WebSocketDisconnect:
        manager.disconnect(websocket)