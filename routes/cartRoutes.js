import express from 'express'
import { addToCart, updateToCart ,deleteFromCart} from '../controllers/cartController.js';
import auth from '../middlewares/authentication.js';

const cartRoutes = express.Router();

// add authentication to all cart routes
cartRoutes.post('/cart',auth,addToCart);

cartRoutes.put('/cart',auth,updateToCart);

cartRoutes.delete('/cart',auth,deleteFromCart);

export default cartRoutes ;