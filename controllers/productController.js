import mongoose from "mongoose";
import Product from "../models/productModel.js";
import isValidObjectId from "../utils/isValidObjectId.js";

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
  const { productId } = req.params;

  try {
    if (!isValidObjectId(productId)) {
      return res.status(400).send({
        msg: "Invalid Product ID",
      });
    }

    const result = await Product.findById(productId); // find Product
    // const result = await Product.findOne({_id : productId}) // can also be used
    // must use await , otherwise server ejects err circular json

    if (!result) {
      // no product existence
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
