from pydantic import BaseModel
from typing import Dict, List

class CartItem(BaseModel):
    product_id: int
    quantity: int = 1

class Cart(BaseModel):
    user_id: str                # simple string for demo (could be UUID)
    items: Dict[int, CartItem] = {}   # product_id → CartItem
    total: float = 0.0
