import express from 'express'
import { getProduct, getProducts } from './controllers/productController.js';

const routes = express.Router();

routes.get('/products',getProducts); // fetch all products

routes.get('/products/:id',getProduct);



export default routes ;