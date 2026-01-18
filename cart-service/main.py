from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import httpx
import uvicorn

from models import Cart, CartItem

app = FastAPI(title="Cart Microservice")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory carts: user_id → Cart
carts: Dict[str, Cart] = {}

PRODUCTS_URL = "http://products:8001/products/"

@app.get("/")
def root():
    return RedirectResponse(url="/docs")

@app.post("/carts/{user_id}", response_model=Cart)
async def create_cart(user_id: str):
    if user_id in carts:
        raise HTTPException(400, "Cart already exists")
    carts[user_id] = Cart(user_id=user_id)
    return carts[user_id]

@app.post("/carts/{user_id}/items", response_model=Cart)
async def add_to_cart(user_id: str, item: CartItem):
    if user_id not in carts:
        raise HTTPException(404, "Cart not found")

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{PRODUCTS_URL}{item.product_id}")
        if resp.status_code != 200:
            raise HTTPException(404, "Product not found")
        product = resp.json()

        cart = carts[user_id]
        if item.product_id in cart.items:
            cart.items[item.product_id].quantity += item.quantity
        else:
            cart.items[item.product_id] = item

        # Recalculate total (call products service again or cache)
        total = 0
        for pid, it in cart.items.items():
            p_resp = await client.get(f"{PRODUCTS_URL}{pid}")
            if p_resp.status_code == 200:
                total += p_resp.json()["price"] * it.quantity

        cart.total = total
        return cart

@app.get("/carts/{user_id}", response_model=Cart)
def get_cart(user_id: str):
    if user_id not in carts:
        raise HTTPException(404, "Cart not found")
    return carts[user_id]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
