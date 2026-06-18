import express from 'express'
import { addToCart, updateToCart } from '../controllers/cartController.js';
import auth from '../middlewares/authentication.js';

const cartRoutes = express.Router();

cartRoutes.post('/cart',auth,addToCart);

cartRoutes.put('/cart',auth,updateToCart);

// cartRoutes.delete('/cart',deleteFromCart);


export default cartRoutes ;