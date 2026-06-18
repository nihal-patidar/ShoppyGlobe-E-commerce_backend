# Shopping Cart API

**Executive Summary:** This project provides a simple **Shopping Cart** REST API built with Node.js, Express, and MongoDB (via Mongoose). It allows authenticated users to **add products to a cart**, **update quantities**, and **remove products** from their cart. Authentication is handled using JSON Web Tokens (JWT), with a middleware that verifies tokens on each protected route. This README documents setup, models, authentication, and each cart endpoint in detail, including request/response schemas, validation rules, example requests, and expected outcomes. 

## Prerequisites & Setup

- **Node.js & npm:** Install [Node.js](https://nodejs.org/) (v14+) and npm.  
- **MongoDB:** Have access to a MongoDB database (local or hosted).  
- **Environment variables:** Create a `.env` file (in project root) with your configuration. At minimum, you need:
  ```
  MONGODB_URI="mongodb://localhost:27017/your-db-name"
  JWT_KEY="your-secret-key"
  PORT=3000
  ```
  - The `MONGODB_URI` is your MongoDB connection string. For local development, you can use `mongodb://127.0.0.1:27017/shop` or similar.  
  - The `JWT_KEY` is a secret string used to sign JWT tokens. **Do not hard-code it; store it in the environment** (e.g. in `.env`) as per Node best practices.  
- **Dependencies:** Install packages with `npm install`. Key dependencies include:
  - `express` – web framework for Node.js  
  - `mongoose` – MongoDB ODM for defining schemas and connecting to the database  
  - `jsonwebtoken` – for creating/verifying JWT tokens  
  - `bcrypt` – for hashing passwords  
  - `dotenv` – loads `.env` configuration into `process.env`  
- **Start the server:** Add scripts in `package.json`, e.g.: `"start": "node index.js"`, `"dev": "nodemon index.js"`. Then run `npm start` (or `npm run dev`) to launch the API. You should see a log like `Connected to MongoDB` if `mongoose.connect()` succeeds.  

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
- **Bearer Token Format:** Protected routes expect an `Authorization` header of the form:  
  ```
  Authorization: Bearer <token>
  ```  
  This is the standard “Bearer” token pattern. For example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...`.  
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

All cart-related endpoints are under `/cart`. They **require authentication** (JWT Bearer token). Below is a summary table, followed by details for each route.

| Method | Endpoint                | Description                        | Auth |
|--------|-------------------------|------------------------------------|------|
| POST   | `/cart`                 | Add a product to the cart          | Yes  |
| PUT    | `/cart/:productId`      | Update quantity of a cart item     | Yes  |
| DELETE | `/cart/:productId`      | Remove a product from the cart     | Yes  |

### 1. **Add Product to Cart** (POST `/cart`)

- **Purpose:** Create a new cart item for the authenticated user.  
- **Auth Required:** Yes. Include header `Authorization: Bearer <token>`.  
- **Request Headers:**  
  - `Content-Type: application/json`  
  - `Authorization: Bearer <token>` (JWT)  

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

- **Success Response:** **201 Created**  
  ```json
  {
    "msg": "Product added to cart successfully",
    "product": {
      "_id": "64c1e5f1a3b2c9dabc123456",
      "userId": "64c1e5bfa3b2c9dabc123450",
      "productId": "64c1e5cfa3b2c9dabc123451",
      "quantity": 2
    }
  }
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

- **Example Requests:**  
  **cURL:**  
  ```bash
  curl -X POST http://localhost:3000/cart \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your-token>" \
    -d '{"productId":"64c1e5cfa3b2c9dabc123451","quantity":2}'
  ```  
  **Fetch (JavaScript):**  
  ```js
  fetch("http://localhost:3000/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <your-token>"
    },
    body: JSON.stringify({ productId: "64c1e5cfa3b2c9dabc123451", quantity: 2 })
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```

### 2. **Update Cart Quantity** (PUT `/cart/:productId`)

- **Purpose:** Update the `quantity` of an existing cart item for the authenticated user.  
- **Auth Required:** Yes (JWT).  
- **Request Headers:**  
  - `Content-Type: application/json`  
  - `Authorization: Bearer <token>`  

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

- **Example Requests:**  
  **cURL:**  
  ```bash
  curl -X PUT http://localhost:3000/cart/64c1e5cfa3b2c9dabc123451 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your-token>" \
    -d '{"quantity":5}'
  ```  
  **Fetch (JavaScript):**  
  ```js
  fetch("http://localhost:3000/cart/64c1e5cfa3b2c9dabc123451", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <your-token>"
    },
    body: JSON.stringify({ quantity: 5 })
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```

### 3. **Remove Product from Cart** (DELETE `/cart/:productId`)

- **Purpose:** Delete a product from the authenticated user’s cart.  
- **Auth Required:** Yes (JWT).  
- **Request Headers:**  
  - `Authorization: Bearer <token>`  

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

- **Example Requests:**  
  **cURL:**  
  ```bash
  curl -X DELETE http://localhost:3000/cart/64c1e5cfa3b2c9dabc123451 \
    -H "Authorization: Bearer <your-token>"
  ```  
  **Fetch (JavaScript):**  
  ```js
  fetch("http://localhost:3000/cart/64c1e5cfa3b2c9dabc123451", {
    method: "DELETE",
    headers: { "Authorization": "Bearer <your-token>" }
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```

## Additional Notes

- **Middleware Attachments:** After JWT verification, `req.user` is an object with `{ userId: "<user-id>" }`. You can access `req.user.userId` in controllers. No other user info (like password) is exposed in the token.  

- **Side Effects:** The **stock check** on product quantity is the only side-effect logic: the API **does not** decrement stock automatically when adding to cart. It only validates that `quantity <= stock_quantity`. (In a full e-commerce app, you might subtract from stock on order checkout.)  

- **Data Consistency:** The `Cart` schema does not enforce DB-level foreign key constraints; however, if you delete a user or product, existing cart items would remain unless you handle cascading deletes manually. You may add Mongoose middleware (pre-hooks) to clean related cart items on user/product deletion as an improvement.  

## Improvements & Security Considerations

- **Hide Sensitive Info:** In the login response, avoid sending the hashed password back. Return only non-sensitive user fields (e.g. exclude `password`).  
- **Use HTTPS:** Always deploy behind HTTPS so the JWT in the Authorization header is encrypted in transit.  
- **Rate Limiting / Brute Force:** Implement rate limiting on authentication endpoints to prevent brute-force attacks.  
- **Password Policies:** The code enforces a strong password (min 8 chars, mixed cases, number) as validation, but consider adding more checks (symbols) or using libraries like `validator`.  
- **Validate IDs:** If a malformed Mongo ID is sent (e.g. wrong format), Mongoose may throw a `CastError`. You could catch this and return 400 instead of letting the server error.  
- **Indexes:** Add MongoDB indexes on `Cart.userId` and `Cart.productId` to speed up queries.  
- **Token Expiry:** JWT expires in 1 day; consider shorter TTL or a refresh token strategy for better security.  
- **Helmet/CORS:** In production, use security middleware (like [Helmet](https://github.com/helmetjs/helmet)) and enable CORS only for allowed origins.  

## Testing Tips

- **Manual Testing:** Use tools like Postman or curl to test each endpoint. First register/login to get a JWT, then include that in the `Authorization` header for `/cart` routes.  
- **Automated Tests:** You can write tests using **Jest** + **Supertest** to simulate API calls. For example, test that `POST /cart` returns 201 with valid input, or 400 when `quantity` is invalid.  
- **Seed Data:** For testing, seed the database with a sample User and Product so you have known IDs to use. Then run `login` to obtain a token.  

## Troubleshooting

- **MongoDB Connection Errors:** Check that `MONGODB_URI` is correct in `.env`. The console should log success or print an error from `mongoose.connect()`.  
- **JWT Errors:** If you see `"Invalid or expired token"`, ensure the `JWT_KEY` in `.env` matches the one used at login, and that the token is not expired. Also confirm the header is exactly `Authorization: Bearer <token>` (case-sensitive).  
- **Duplicate Email (409 on Register):** If you retry registration with the same email, the unique index on User.email will cause a conflict. Handle or reset the test data as needed.  
- **Unhandled Exceptions:** Add a catch-all error handler in Express (e.g. `app.use((err, req, res, next) => { ... })`) to avoid crashing. Log errors for debugging.  

---

**References:** We used standard JWT/Bearer patterns, Node.js environment conventions, and Mongoose schema validation rules to design this API. The code samples above align with official guidelines.