import express from 'express'
import { addToCart, updateToCart ,deleteFromCart} from '../controllers/cartController.js';
import auth from '../middlewares/authentication.js';

const cartRoutes = express.Router(); //initializes express router

// add authentication to all cart routes
cartRoutes.post('/cart',auth,addToCart); // protected route to add item to cart

cartRoutes.put('/cart/:productId',auth,updateToCart); // protected route to update item on cart

cartRoutes.delete('/cart/:productId',auth,deleteFromCart); // protected route to remove item from cart

export default cartRoutes ;