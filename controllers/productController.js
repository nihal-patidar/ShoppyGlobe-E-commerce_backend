import Product from "../models/productModel.js";

async function getProducts(req, res) {
    console.log("working");

    try {
        const result = await Product.find({});

        res.status(200).send({
            products: result
        });

    } catch (err) {
        console.log("getProducts", err);

        res.status(500).send({
            msg: "Internal Server Error"
        });
    }
}

export { getProducts };