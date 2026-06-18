import Cart from "../models/cartModel.js";

async function addToCart(req, res) {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
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

    const cartItem = await Cart.create({
      userId: userId,
      productId: productId,
      quantity: quantity,
    });

    return res.status(201).send({
        msg : "Product has been added to cart",
        product : { userId, productId, quantity }
    })

  } catch (err) {

    return res.status(500).send({
      msg: "Internal Server Error",
    });

  }
}


export {addToCart}