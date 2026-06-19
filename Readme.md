# Shopping Cart API

**Executive Summary:** This project provides a simple **Shopping Cart** REST API built with Node.js, Express, and MongoDB (via Mongoose). It allows authenticated users to **add products to a cart**, **update quantities**, and **remove products** from their cart. Authentication is handled using JSON Web Tokens (JWT), with a middleware that verifies tokens on each protected route. This README documents setup, models, authentication, and each cart endpoint in detail, including request/response schemas, validation rules, example requests, and expected outcomes. 
## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/nihal-patidar/ShoppyGlobe-E-commerce_backend.git
cd ShoppyGlobe-E-commerce_backend
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_KEY=your_secret_jwt_key
```

Example:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/shoppyglobe

JWT_KEY=mySecretKey123
```

---

### 4. Seed Dummy Products

Populate the Products collection with sample data before testing APIs.

```bash
node utils/seedProducts.js
```

Expected Output:

```bash
Products seeded successfully
```

---

### 5. Start Development Server

```bash
npm start
```

or

```bash
node server.js
```

Expected Output:

```bash
MongoDB Connected Successfully
Server running on port 5000
```

---

### 6. Verify API

Open Thunder Client or Postman and test:

```http
GET http://localhost:5000/products
```

If products are returned successfully, the setup is complete.

---

## Project Structure

```text
ShoppyGlobe-E-commerce_backend
│
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   └── productController.js
│
├── middlewares/
│   └── auth.js
│
├── models/
│   ├── userModel.js
│   ├── productModel.js
│   └── cartModel.js
│
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   └── productRoutes.js
│
├── utils/
│   └── seedProducts.js
│
├── screenshots/
│
├── .env
├── index.js
├── routes.js
├── package.json
└── README.md
```

---

## Available API Routes

### Authentication

| Method | Route | Description |
|----------|----------|----------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login user and generate JWT token |

### Products

| Method | Route | Description |
|----------|----------|----------|
| GET | `/products` | Fetch all products |
| GET | `/products/:id` | Fetch single product by ID |

### Cart (Protected Routes)

| Method | Route | Description |
|----------|----------|----------|
| POST | `/cart` | Add product to cart |
| PUT | `/cart/:productId` | Update cart quantity |
| DELETE | `/cart/:productId` | Remove product from cart |

## Authentication (JWT)

- **Token Issuance:** When a user logs in (via a separate `/login` endpoint), the server signs a JWT payload containing the user’s ID. For example:  
  ```js
  const token = jwt.sign(
    { userId: existingUser._id },
    process.env.JWT_KEY,
    { expiresIn: "1d" }
  );
  ```  
  This creates a token that expires in 1 day. The client then sends this token in the `Authorization` header for protected requests.  
- **Jwt Token Format:** Protected routes expect an `Authorization` header of the form:  
  ```
  Authorization: Jwt <token>
  ```  
  This is the standard “Jwt” token pattern. For example: `Authorization: Jwt eyJhbGciOiJIUzI1NiIsInR5cCI...`.  
- **Middleware Verification:** The `auth` middleware extracts and verifies the token. In this app, it does:
  ```js
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ msg: "Authentication token is required" });
  const data = jwt.verify(token, process.env.JWT_KEY);
  req.user = { userId: data.userId };  // attach to request
  next();
  ```  
  After this middleware runs, protected routes can access `req.user.userId` to know which user is authenticated.  

## Data Models

The main Mongoose schemas are **User**, **Product**, and **Cart**. Key fields and constraints:

- **User** (`users` collection):  
  - `name` (String, required) – User’s full name.  
  - `email` (String, required, unique) – User’s email (lowercased and trimmed).  
  - `password` (String, required) – Hashed password.  
  - Timestamps (`createdAt`, `updatedAt`) automatically added by Mongoose.  

- **Product** (`products` collection):  
  - `name` (String, required) – Product name (trimmed).  
  - `price` (Number, required, min 0) – Product price (no negatives).  
  - `description` (String, required) – Product description (trimmed).  
  - `stock_quantity` (Number, required, min 0) – Units in stock (no negatives).  
  - Timestamps (`createdAt`, `updatedAt`).  

- **Cart** (`carts` collection):  
  - `userId` (ObjectId, required) – Reference to the **User** (who owns this cart item).  
  - `productId` (ObjectId, required) – Reference to the **Product**.  
  - `quantity` (Number, required, min 1) – How many units of this product in the cart (at least 1).  

Many schema options (e.g. `required`, `unique`, `min`, `trim`) are built-in Mongoose validators. For example, setting `required: true` ensures Mongoose will reject missing fields, and `trim: true` auto-trims whitespace on strings. 

## API Endpoints

All cart-related endpoints are under `/cart`. They **require authentication** (JWT Jwt token). Below is a summary table, followed by details for each route.

| Method | Endpoint                | Description                        | Auth |
|--------|-------------------------|------------------------------------|------|
| POST   | `/cart`                 | Add a product to the cart          | Yes  |
| PUT    | `/cart/:productId`      | Update quantity of a cart item     | Yes  |
| DELETE | `/cart/:productId`      | Remove a product from the cart     | Yes  |

### 1. **Add Product to Cart** (POST `/cart`)

- **Purpose:** Create a new cart item for the authenticated user.  
- **Auth Required:** Yes. Include header `Authorization: Jwt <token>`.  
- **Request Headers:**  
  - `Content-Type: application/json`  
  - `Authorization: Jwt <token>` (JWT)  

- **Request Body (JSON):**  
  | Field      | Type   | Required | Details                                 |
  |------------|--------|----------|-----------------------------------------|
  | `productId`| String | Yes      | The ObjectId of an existing **Product** |
  | `quantity` | Number | Yes      | Number of units to add (≥ 1)            |

- **Validation Rules:**  
  - If `productId` or `quantity` is missing: **400 Bad Request**, `{ msg: "Product ID and quantity are required" }`.  
  - If `quantity` is not a number or `< 1`: **400 Bad Request**, `{ msg: "Quantity must be greater than 0" }`.  
  - If the specified product does not exist: **404 Not Found**, `{ msg: "Product not found" }`.  
  - If `quantity > product.stock_quantity`: **400 Bad Request**, `{ msg: "Requested quantity exceeds available stock" }`.  
  - If a cart item for this user & product already exists: **409 Conflict**, `{ msg: "Product already exists in cart" }`.  

- **Processing Steps:**  
  1. Verify JWT and get `userId` from `req.user`.  
  2. Validate input fields.  
  3. Fetch the product by `productId`.  
  4. Check `product.stock_quantity` vs requested `quantity`.  
  5. Query `Cart` to see if an item already exists for `(userId, productId)`.  
  6. If all checks pass, create a new `Cart` document:  
     ```js
     await Cart.create({ userId, productId, quantity });
     ```  

  The `"product"` field contains the newly created cart item (with its `_id`, etc.).

- **Error Responses:**  
  - **400 Bad Request:** Invalid input, e.g.:  
    ```json
    { "msg": "Product ID and quantity are required" }
    ```  
    ```json
    { "msg": "Quantity must be greater than 0" }
    ```  
    ```json
    { "msg": "Requested quantity exceeds available stock" }
    ```
  - **401 Unauthorized:** Missing or invalid JWT token (see *Authentication* above). Example:  
    ```json
    { "msg": "Authentication token is required" }
    ```  
  - **404 Not Found:** Product ID not found or (in other routes) cart item not found. Example:  
    ```json
    { "msg": "Product not found" }
    ```  
  - **409 Conflict:** Duplicate item. Example:  
    ```json
    { "msg": "Product already exists in cart" }
    ```  
  - **500 Internal Server Error:** Any unexpected error. Example:  
    ```json
    { "msg": "Internal Server Error" }
    ```

-

### 2. **Update Cart Quantity** (PUT `/cart/:productId`)

- **Purpose:** Update the `quantity` of an existing cart item for the authenticated user.  
- **Auth Required:** Yes (JWT).  
- **Request Headers:**  
  - `Content-Type: application/json`  
  - `Authorization: Jwt <token>`  

- **Route Parameters:**  
  - `productId` (String, required) – The ObjectId of the product to update in the cart (in the URL).

- **Request Body (JSON):**  
  | Field     | Type   | Required | Details                  |
  |-----------|--------|----------|--------------------------|
  | `quantity`| Number | Yes      | New quantity (≥ 1)       |

- **Validation Rules:**  
  - If `quantity` is missing or invalid: **400 Bad Request**, `{ msg: "Product ID and quantity are required" }` or `{ msg: "Quantity must be greater than 0" }`.  
  - The `productId` must match an existing product, else **404 Not Found**, `{ msg: "Product not found" }`.  
  - If `quantity > product.stock_quantity`: **400 Bad Request**, `{ msg: "Requested quantity exceeds available stock" }`.  

- **Processing Steps:**  
  1. Verify JWT and get `userId`.  
  2. Validate inputs (note: `productId` comes from `req.params`).  
  3. Fetch the product to ensure it exists and check stock.  
  4. Update the cart item:  
     ```js
     const updatedCartItem = await Cart.findOneAndUpdate(
       { userId, productId },
       { $set: { quantity } },
       { returnDocument: "after" }  // returns the updated doc
     );
     ```  
  5. If no matching cart item was found (`updatedCartItem == null`), return 404.  

- **Success Response:** **200 OK**  
  ```json
  {
    "msg": "Cart quantity updated successfully",
    "product": {
      "_id": "64c1e5f1a3b2c9dabc123456",
      "userId": "64c1e5bfa3b2c9dabc123450",
      "productId": "64c1e5cfa3b2c9dabc123451",
      "quantity": 5
    }
  }
  ```  
  The `"product"` field is the updated cart document.

- **Error Responses:**  
  - **400 Bad Request:** Invalid input (same messages as POST).  
  - **401 Unauthorized:** Missing/invalid JWT.  
  - **404 Not Found:** Either the product does not exist, or the cart item for this user/product was not found. Example:  
    ```json
    { "msg": "Cart item not found" }
    ```  
  - **500 Internal Server Error:** On unexpected failures.  

-

### 3. **Remove Product from Cart** (DELETE `/cart/:productId`)

- **Purpose:** Delete a product from the authenticated user’s cart.  
- **Auth Required:** Yes (JWT).  
- **Request Headers:**  
  - `Authorization: Jwt <token>`  

- **Route Parameters:**  
  - `productId` (String, required) – The ObjectId of the product to remove.

- **Request Body:** None.

- **Validation Rules:**  
  - If `productId` is missing (though in a well-formed request it’s in the URL).  
- **Processing Steps:**  
  1. Verify JWT, get `userId`.  
  2. Delete the cart item:  
     ```js
     const deletedCartItem = await Cart.findOneAndDelete({ userId, productId });
     ```  
  3. If no item was deleted (`deletedCartItem == null`), respond with 404.  

- **Success Response:** **200 OK**  
  ```json
  {
    "msg": "Cart item removed successfully",
    "product": {
      "_id": "64c1e5f1a3b2c9dabc123456",
      "userId": "64c1e5bfa3b2c9dabc123450",
      "productId": "64c1e5cfa3b2c9dabc123451",
      "quantity": 2
    }
  }
  ```  
  `"product"` contains the deleted cart item data.

- **Error Responses:**  
  - **400 Bad Request:** If `productId` is not provided (e.g. malformed route).  
  - **401 Unauthorized:** Missing/invalid JWT.  
  - **404 Not Found:** No cart item matching `(userId, productId)` was found.  
  - **500 Internal Server Error:** Unexpected issues.  


## API Testing Screenshots

### 01. User Registration

#### Register User
**API:** `POST /register`

Registers a new user account after validating name, email, and password.

**Screenshot:** `screenshots/01-register-user.png`

![Register User](./screenshots/01-register-user.png)

---

#### Email Validation
**API:** `POST /register`

Validates email format before creating a user account.

**Screenshot:** `screenshots/01-register-email-validation.png`

![Register Email Validation](./screenshots/01-register-email-validation.png)

---

#### Password Validation
**API:** `POST /register`

Ensures password contains:
- Minimum 8 characters
- One uppercase letter
- One lowercase letter
- One number

**Screenshot:** `screenshots/01-password-validation.png`

![Password Validation](./screenshots/01-password-validation.png)

---

#### User Already Exists Validation
**API:** `POST /register`

Prevents duplicate user registration using the same email address.

**Screenshot:** `screenshots/01-user-already-exists.png`

![User Already Exists](./screenshots/01-user-already-exists.png)

---

#### MongoDB User Collection
Displays newly registered user stored in MongoDB.

**Screenshot:** `screenshots/01-db-user-register.png`

![User Collection](./screenshots/01-db-user-register.png)

---

### 02. User Login

#### Login User
**API:** `POST /login`

Authenticates user credentials and generates a JWT authentication token.

**Screenshot:** `screenshots/02-login-user.png`

![Login User](./screenshots/02-login-user.png)

---

### 03. Product APIs

#### Seed Dummy Products
Populates the Products collection with sample product data.

**Screenshot:** `screenshots/03-seed-dummy-products.png`

![Seed Products](./screenshots/03-seed-dummy-products.png)

---

#### MongoDB Product Collection
Shows product documents stored in MongoDB.

**Screenshot:** `screenshots/03-db-seed-product.png`

![Product Collection](./screenshots/03-db-seed-product.png)

---

### 04. Get Product By ID

#### Fetch Single Product
**API:** `GET /products/:id`

Returns details of a specific product using its MongoDB ObjectId.

**Screenshot:** `screenshots/04-get-a-product.png`

![Get Product](./screenshots/04-get-a-product.png)

---

### 05. Get All Products

#### Fetch Product List
**API:** `GET /products`

Returns all available products from MongoDB.

**Screenshot:** `screenshots/05-get-all-product.png`

![Get All Products](./screenshots/05-get-all-product.png)

---

### 06. Add Product To Cart

#### Add To Cart
**API:** `POST /cart`

Adds a product to the authenticated user's shopping cart.

**Screenshot:** `screenshots/06-add-to-cart.png`

![Add To Cart](./screenshots/06-add-to-cart.png)

---

#### Protected Route Validation
**API:** `POST /cart`

Validates JWT token before allowing access to cart operations.

**Screenshot:** `screenshots/06-authentication-failed.png`

![Authentication Failed](./screenshots/06-authentication-failed.png)

---

#### Duplicate Cart Item Validation
**API:** `POST /cart`

Prevents adding the same product multiple times to the user's cart.

**Screenshot:** `screenshots/06-duplicate-cartitem-validation.png`

![Duplicate Cart Item](./screenshots/06-duplicate-cartitem-validation.png)

---

#### MongoDB Cart Collection
Displays cart item successfully stored in MongoDB.

**Screenshot:** `screenshots/06-db-add-to-cart.png`

![Cart Collection](./screenshots/06-db-add-to-cart.png)

---

### 07. Update Cart

#### Update Cart Quantity
**API:** `PUT /cart/:productId`

Updates quantity of a product already present in the user's cart.

**Screenshot:** `screenshots/07-update-to-cart.png`

![Update Cart](./screenshots/07-update-to-cart.png)

---

#### Protected Route Validation
**API:** `PUT /cart/:productId`

Verifies JWT authentication before allowing cart modification.

**Screenshot:** `screenshots/07-protected-update-cart-route.png`

![Protected Update Route](./screenshots/07-protected-update-cart-route.png)

---

#### Stock Validation
**API:** `PUT /cart/:productId`

Prevents updating cart quantity beyond available product stock.

**Screenshot:** `screenshots/07-update-out-of-stock-validation.png`

![Stock Validation](./screenshots/07-update-out-of-stock-validation.png)

---

#### Cart Item Not Found
**API:** `PUT /cart/:productId`

Returns an error when attempting to update a non-existent cart item.

**Screenshot:** `screenshots/07-item-not-found-update.png`

![Item Not Found](./screenshots/07-item-not-found-update.png)

---

### Features Demonstrated

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Product Listing
- Product Details
- Add Product To Cart
- Update Cart Quantity
- MongoDB Integration
- Input Validation
- Duplicate Record Prevention
- Stock Validation
- Error Handling
- Thunder Client API Testing