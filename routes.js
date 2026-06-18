import express from 'express'
import { getProducts } from './controllers/productController.js';

const routes = express.Router();

routes.get('/products',getProducts);

export default routes ;