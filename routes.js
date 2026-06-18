import express from 'express'
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

const routes = express.Router()  // creates express router for nested or child routes

routes.use(authRoutes); // centralizes all auth routes (e.g. login , register)

routes.use(productRoutes); // single point of entry for all product routes (e.g. products/:id)

routes.use(cartRoutes) // mounts all cart routes on this single entry

export default routes ;