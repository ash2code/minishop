from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uvicorn

from models import Product, ProductCreate

app = FastAPI(title="Products Microservice")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory "database"
products_db: Dict[int, Product] = {}
next_id = 1

@app.get("/")
def root():
    return RedirectResponse(url="/docs")

@app.post("/products/", response_model=Product, status_code=201)
def create_product(product: ProductCreate):
    global next_id
    new_product = Product(id=next_id, **product.dict())
    products_db[next_id] = new_product
    next_id += 1
    return new_product

@app.get("/products/", response_model=List[Product])
def list_products():
    return list(products_db.values())

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    if product_id not in products_db:
        raise HTTPException(404, "Product not found")
    return products_db[product_id]

@app.patch("/products/{product_id}/stock", response_model=Product)
def update_stock(product_id: int, quantity: int):
    if product_id not in products_db:
        raise HTTPException(404, "Product not found")
    prod = products_db[product_id]
    if prod.stock + quantity < 0:
        raise HTTPException(400, "Not enough stock")
    prod.stock += quantity
    return prod

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
