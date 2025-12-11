### Configure Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gmail Configuration (for email sending)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 📡 API Endpoints

### Users API
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get single user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Products API
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Shopping Carts API
- `GET /api/shopping-carts` - Get all cart items (with joined user & product data)
- `POST /api/shopping-carts` - Add item to cart
- `GET /api/shopping-carts/[id]` - Get single cart item
- `PUT /api/shopping-carts/[id]` - Update cart quantity
- `DELETE /api/shopping-carts/[id]` - Remove from cart

### Email API
- `GET /api/send-email` - Check email configuration
- `POST /api/send-email` - Send email

### Images API
- `GET /api/images` - Get all images
- `POST /api/images/upload` - Upload image (multipart/form-data)
- `DELETE /api/images?id=[image_id]` - Delete image

### External Users API
- `GET /api/fetch-external-users` - View saved external users
- `POST /api/fetch-external-users` - Fetch & save from JSONPlaceholder
- `DELETE /api/fetch-external-users` - Delete all external users

## 🧪 Testing with cURL

### Test Users
```bash
# Get all users
curl http://localhost:3000/api/users

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","address":"123 Main St"}'

# Update user
curl -X PUT http://localhost:3000/api/users/[user_id] \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Jane Doe","address":"456 Oak Ave"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/[user_id]
```

### Test Products
```bash
# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Laptop","price":999.99,"manufacturing_date":"2024-01-15"}'
```

### Test Shopping Cart
```bash
# Add to cart
curl -X POST http://localhost:3000/api/shopping-carts \
  -H "Content-Type: application/json" \
  -d '{"user_id":"[user_id]","product_id":"[product_id]","quantity":2}'
```

### Test Email
```bash
# Send email
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"recipient@example.com","subject":"Test","message":"Hello World"}'
```

### Test Image Upload
```bash
# Upload image
curl -X POST http://localhost:3000/api/images/upload \
  -F "file=@/path/to/image.jpg"
```

### Test External Users
```bash
# Fetch and save external users
curl -X POST http://localhost:3000/api/fetch-external-users

# View saved users
curl http://localhost:3000/api/fetch-external-users
```

## Database Schema

### users
- `user_id` (UUID, PK)
- `full_name` (VARCHAR)
- `address` (TEXT)
- `registration_date` (TIMESTAMP)

### products
- `product_id` (UUID, PK)
- `product_name` (VARCHAR)
- `price` (DECIMAL)
- `manufacturing_date` (DATE)

### shopping_carts
- `cart_id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `product_id` (UUID, FK → products)
- `quantity` (INTEGER)
- `added_date` (TIMESTAMP)

### images
- `image_id` (UUID, PK)
- `filename` (VARCHAR)
- `url` (TEXT)
- `uploaded_at` (TIMESTAMP)

### external_users
- `id` (INTEGER, PK)
- `name`, `username`, `email`, `phone`, `website`
- Address fields: `address_street`, `address_suite`, `address_city`, `address_zipcode`
- Geo coordinates: `address_geo_lat`, `address_geo_lng`
- Company fields: `company_name`, `company_catchphrase`, `company_bs`

## API Response Format

All endpoints return consistent JSON responses:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* object or array */ },
  "count": 10 // for list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```
