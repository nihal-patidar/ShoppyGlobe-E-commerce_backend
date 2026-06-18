import express from 'express'
import { getProduct, getProducts } from '../controllers/productController.js';

const productRoutes = express.Router();

productRoutes.get('/products',getProducts); // fetch all products

productRoutes.get('/products/:id',getProduct);

export default productRoutes ;