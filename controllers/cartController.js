import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import isValidObjectId from "../utils/isValidObjectId.js";

// Add product to cart
async function addToCart(req, res) {
  // Extract request data
  const { productId, quantity } = req.body;

  if (!isValidObjectId(productId)) {
    // validating objectId
    return res.status(400).send({
      msg: "Invalid Product ID",
    });
  }

  // Extract authenticated user id
  const { userId } = req.user;

  if (!isValidObjectId(productId)) {
    return res.status(400).send({
      msg: "Invalid User ID",
    });
  }

  // Validate required fields
  if (!productId || quantity === undefined) {
    return res.status(400).send({
      msg: "Product ID and quantity are required",
    });
  }

  // Validate quantity
  if (isNaN(quantity) || Number(quantity) < 1) {
    return res.status(400).send({
      msg: "Quantity must be greater than 0",
    });
  }

  try {
    // Check product existence
    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).send({
        msg: "Product not found",
      });
    }

    // Validate stock availability
    if (Number(quantity) > product.stock_quantity) {
      return res.status(400).send({
        msg: "Requested quantity exceeds available stock",
      });
    }

    // Check duplicate cart item
    const existingCartItem = await Cart.findOne({
      userId,
      productId,
    });

    if (existingCartItem) {
      return res.status(409).send({
        msg: "Product already exists in cart",
      });
    }

    // Create cart item
    const cartItem = await Cart.create({
      userId,
      productId,
      quantity,
    });

    return res.status(201).send({
      msg: "Product added to cart successfully",
      product: cartItem,
    });
  } catch (err) {
    console.log("addToCart", err);

    return res.status(500).send({
      msg: "Internal Server Error",
    });
  }
}

// Update cart item quantity
async function updateToCart(req, res) {
  // Extract route parameter
  const { productId } = req.params;

  // Extract request data
  const { quantity } = req.body;

  // Extract authenticated user id
  const { userId } = req.user;

  if (!isValidObjectId(productId)) {
    return res.status(400).send({
      msg: "Invalid Product ID",
    });
  }

  if (!isValidObjectId(userId)) {
    return res.status(400).send({
      msg: "Invalid User ID",
    });
  }

  // Validate required fields
  if (!productId || quantity === undefined) {
    return res.status(400).send({
      msg: "Product ID and quantity are required",
    });
  }

  // Validate quantity
  if (isNaN(quantity) || Number(quantity) < 1) {
    return res.status(400).send({
      msg: "Quantity must be greater than 0",
    });
  }

  try {
    // Check product existence
    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).send({
        msg: "Product not found",
      });
    }

    // Validate stock availability
    if (Number(quantity) > product.stock_quantity) {
      return res.status(400).send({
        msg: "Requested quantity exceeds available stock",
      });
    }

    // Update cart item
    const updatedCartItem = await Cart.findOneAndUpdate(
      {
        userId,
        productId,
      },
      {
        $set: {
          quantity,
        },
      },
      {
        returnDocument: "after",
      },
    );

    if (!updatedCartItem) {
      return res.status(404).send({
        msg: "Cart item not found",
      });
    }

    return res.status(200).send({
      msg: "Cart quantity updated successfully",
      product: updatedCartItem,
    });
  } catch (err) {
    console.log("updateToCart", err);

    return res.status(500).send({
      msg: "Internal Server Error",
    });
  }
}

// Remove product from cart
async function deleteFromCart(req, res) {
  // Extract route parameter
  const { productId } = req.params;

  // Extract authenticated user id
  const { userId } = req.user;

  if (!isValidObjectId(productId)) {
    return res.status(400).send({
      msg: "Invalid Product ID",
    });
  }
  if (!isValidObjectId(userId)) {
    return res.status(400).send({
      msg: "Invalid User ID",
    });
  }

  // Validate required field
  if (!productId) {
    return res.status(400).send({
      msg: "Product ID is required",
    });
  }

  try {
    // Delete cart item belonging to authenticated user
    const deletedCartItem = await Cart.findOneAndDelete({
      userId,
      productId,
    });

    if (!deletedCartItem) {
      return res.status(404).send({
        msg: "Cart item not found",
      });
    }

    return res.status(200).send({
      msg: "Cart item removed successfully",
      product: deletedCartItem,
    });
  } catch (err) {
    console.log("deleteFromCart", err);

    return res.status(500).send({
      msg: "Internal Server Error",
    });
  }
}

export { addToCart, updateToCart, deleteFromCart };
