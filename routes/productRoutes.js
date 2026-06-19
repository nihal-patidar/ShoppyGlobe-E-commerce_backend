import express from 'express'
import { getProduct, getProducts } from '../controllers/productController.js';

const productRoutes = express.Router(); // initializes express router

productRoutes.get('/products',getProducts); // attaches controller to get all products

productRoutes.get('/products/:productId',getProduct); // gets a product having id 

export default productRoutes ;