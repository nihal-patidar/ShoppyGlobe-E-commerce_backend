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

  try{

  const product = await Cart.findOne({userId : userId , productId : productId});

  if(!product){
    return res.status(404).send({
        msg : "product is not found users cart",
    })
  }

  const updateProduct = await Cart.updateOne({_id : product._id},{
    $set : {quantity : quantity}
  })

  return res.status(200).send({
    msg : "Quantity has been updated successfully",
    product : updateProduct
  })

}catch(err){
    console.log("updateToCart" , err);

    return res.status(500).send({
        msg : "Interval Server Error",
    })

}
}

export { addToCart, updateToCart };
