import express from 'express'
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';

const routes = express.Router()


routes.use(authRoutes);

routes.use(productRoutes);
export default routes ;