import mongoose from "mongoose";
import Product from "../models/productModel.js";

async function getProducts(req, res) {
  console.log("working");

  try {
    const result = await Product.find({});

    res.status(200).send({
      products: result,
    });
  } catch (err) {
    console.log("getProducts", err);

    res.status(500).send({
      msg: "Internal Server Error",
    });
  }
}

async function getProduct(req, res) {
  const { id } = req.params;

  try {
    // validation for wrong product id
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).send({
        msg : "Product isn't valid"
      })
    }

    const result = await Product.findById(id); // find Product
    // const result = await Product.findOne({_id : id}) // can also be used
    // must use await , otherwise server ejects err circular json

    if (!result) {  // no product existence
      return res.status(404).send({
        msg: "Product not found",
      });
    }

    return res.status(200).send({
      // return response
      product: result,
    });
  } catch (err) {
    console.log("getProduct ", err);
    return res.status(500).send({
      msg: "Internal Server Error",
    });
  }

}

export { getProducts, getProduct };
