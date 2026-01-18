# Mini Shop Microservices Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           User's Browser                             │
│                      http://localhost:3000                           │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Frontend Container (Nginx)                         │
│                       Port: 3000 → 80                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  React Application (Static Files)                           │   │
│  │  - Product List UI                                           │   │
│  │  - Shopping Cart UI                                          │   │
│  │  - Add Product Form                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Nginx Proxy Configuration:                                          │
│  - /api/products/ → http://products:8001/products/                   │
│  - /api/carts/ → http://cart:8002/carts/                            │
└───────────────┬──────────────────────────┬────────────────────────┬─┘
                │                          │                        │
                │   Docker Network:        │                        │
                │   shop-network           │                        │
                ▼                          ▼                        ▼
┌───────────────────────────┐  ┌──────────────────────────┐  (Future services)
│  Products Service         │  │  Cart Service            │
│  Container: products      │  │  Container: cart         │
│  Port: 8001               │  │  Port: 8002              │
│  ┌─────────────────────┐ │  │  ┌────────────────────┐ │
│  │ FastAPI Application │ │  │  │ FastAPI App        │ │
│  │                     │ │  │  │                    │ │
│  │ Endpoints:          │ │  │  │ Endpoints:         │ │
│  │ GET  /products/     │ │  │  │ POST /carts/{id}   │ │
│  │ POST /products/     │ │  │  │ GET  /carts/{id}   │ │
│  │ GET  /products/{id} │◄─┼──┼──│ POST /carts/{id}/  │ │
│  │ PATCH /products/... │ │  │  │      items         │ │
│  └─────────────────────┘ │  │  └────────────────────┘ │
│                           │  │                          │
│  In-Memory Database:      │  │  In-Memory Database:     │
│  products_db = {}         │  │  carts = {}              │
└───────────────────────────┘  └──────────────────────────┘
```

## Data Flow Diagrams

### 1. View Products Flow
```
User Browser
    │
    │ GET /
    ▼
Frontend (React)
    │
    │ GET /api/products/
    ▼
Nginx Proxy
    │
    │ GET /products/
    ▼
Products Service
    │
    │ Return: [{ id, name, price, stock }]
    ▼
Frontend (Render product cards)
```

### 2. Add to Cart Flow
```
User clicks "Add to Cart"
    │
    ▼
Frontend (React)
    │
    │ POST /api/carts/customer1/items
    │ Body: { product_id: 1, quantity: 3 }
    ▼
Nginx Proxy
    │
    │ POST /carts/customer1/items
    ▼
Cart Service
    │
    │ GET http://products:8001/products/1
    │ (Validate product exists & get price)
    ▼
Products Service
    │
    │ Return: { id: 1, name: "coffee", price: 1.0, stock: 10 }
    ▼
Cart Service
    │
    │ Calculate total: price × quantity
    │ Update cart in memory
    │ Return: { user_id, items: {...}, total: 3.0 }
    ▼
Frontend (Update cart display)
```

### 3. Add Product Flow (Admin)
```
Admin clicks "Add Product"
    │
    │ Fill form: name, price, stock
    ▼
Frontend (React)
    │
    │ POST /api/products/
    │ Body: { name: "Latte", price: 3.5, stock: 20 }
    ▼
Nginx Proxy
    │
    │ POST /products/
    ▼
Products Service
    │
    │ Create product with new ID
    │ Store in products_db
    │ Return: { id: 2, name: "Latte", price: 3.5, stock: 20 }
    ▼
Frontend (Refresh product list)
```

## Container Communication

```
┌──────────────────────────────────────────────────────┐
│           Docker Network: shop-network               │
│                                                       │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐    │
│  │ frontend │────▶│ products │     │   cart   │    │
│  │  :80     │     │  :8001   │◀────│  :8002   │    │
│  └──────────┘     └──────────┘     └──────────┘    │
│       │                                              │
│       │ Container names resolve via Docker DNS      │
│       │ - products → 172.19.0.x                     │
│       │ - cart → 172.19.0.y                         │
│       │ - frontend → 172.19.0.z                     │
└──────────────────────────────────────────────────────┘
         │
         │ Port mapping to host
         ▼
    Host Machine (WSL2)
    - localhost:3000 → frontend:80
    - localhost:8001 → products:8001
    - localhost:8002 → cart:8002
```

## Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Layer                    │
│  - React 18                                          │
│  - CSS3 (Custom styling)                             │
│  - Fetch API (HTTP client)                           │
│  - Nginx (Web server + Reverse proxy)                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   Backend Layer                      │
│  - Python 3.12                                       │
│  - FastAPI (Web framework)                           │
│  - Uvicorn (ASGI server)                             │
│  - Pydantic (Data validation)                        │
│  - httpx (Async HTTP client)                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Infrastructure Layer                    │
│  - Docker (Containerization)                         │
│  - Docker Networks (Service communication)           │
│  - In-memory storage (No external DB)                │
└─────────────────────────────────────────────────────┘
```

## Deployment Commands

### Start All Services
```bash
# Create network
docker network create shop-network

# Start backend services
docker run -d -p 8001:8001 --name products --network shop-network mini-shop-products:latest
docker run -d -p 8002:8002 --name cart --network shop-network mini-shop-cart:latest

# Start frontend
docker run -d -p 3000:80 --name frontend --network shop-network mini-shop-frontend:latest
```

### Stop All Services
```bash
docker stop frontend cart products
docker rm frontend cart products
```

## API Endpoints Reference

### Products Service (Port 8001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products/ | List all products |
| POST | /products/ | Create a new product |
| GET | /products/{id} | Get product by ID |
| PATCH | /products/{id}/stock | Update product stock |

### Cart Service (Port 8002)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /carts/{user_id} | Create cart for user |
| GET | /carts/{user_id} | Get user's cart |
| POST | /carts/{user_id}/items | Add item to cart |

## Future Enhancements

```
Potential additions:
├── Authentication Service (JWT tokens)
├── Order Service (Checkout & order history)
├── Payment Service (Payment processing)
├── Notification Service (Email/SMS)
├── Database Layer (PostgreSQL/MongoDB)
├── Message Queue (RabbitMQ/Kafka)
├── API Gateway (Kong/Traefik)
└── Monitoring (Prometheus + Grafana)
```
