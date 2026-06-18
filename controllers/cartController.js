import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js"

async function addToCart(req, res) {
  const { productId, quantity } = req.body;
  const { userId } = req.user;

  if (!productId || !quantity) {
    return res.status(400).send({
      msg: "userId, productId and quantity all are required",
    });
  }

  if (isNaN(quantity) || Number(quantity) < 1) {
    return res.status(400).send({
      msg: "quantity should 1 or greater",
    });
  }

  try {
     const product = await Product.findById(productId);

    if(quantity > product.stock_quantity){
      return res.status(200).send({
        msg : "Out of Stock"
      })
    }

    const cartItem = await Cart.create({
      userId: userId,
      productId: productId,
      quantity: quantity,
    });

    return res.status(201).send({
      msg: "Product has been added to cart",
      product: { userId, productId, quantity },
    });
  } catch (err) {
    return res.status(500).send({
      msg: "Internal Server Error",
    });
  }
}

async function updateToCart(req, res) {
  const { productId, quantity } = req.body;

  const { userId } = req.user;

  if (!productId || !quantity) {
    return res.status(400).send({
      msg: "productId and quantity all are required",
    });
  }

  if (isNaN(quantity) || Number(quantity) < 1) {
    return res.status(400).send({
      msg: "quantity should 1 or greater",
    });
  }

  try {
    // validate product availability before adding to the cart.

    const product = await Product.findById(productId);

    if(quantity > product.stock_quantity){
      return res.status(200).send({
        msg : "Out of Stock"
      })
    }

    const updatedProduct = await Cart.findOneAndUpdate(
      { userId: userId, productId: productId },
      { $set: { quantity: quantity } },
      { new : true } // return updated data
    );

    return res.status(200).send({
      msg: "Quantity has been updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.log("updateToCart", err);

    return res.status(500).send({
      msg: "Interval Server Error",
    });
  }
}

export { addToCart, updateToCart };
