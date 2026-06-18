import express from 'express'
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

const routes = express.Router()

routes.use(authRoutes);

routes.use(productRoutes);

routes.use(cartRoutes)

export default routes ;