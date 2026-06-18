import express from 'express'
import { addToCart } from '../controllers/cartController.js';

const cartRoutes = express.Router();

cartRoutes.post('/cart',addToCart);

// cartRoutes.put('/cart',updateToCart);

// cartRoutes.delete('/cart',deleteFromCart);


export default cartRoutes ;