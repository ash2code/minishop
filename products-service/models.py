from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    price: float
    stock: int = 10

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True
