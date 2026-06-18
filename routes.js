import express from 'express'
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';


routes.use(productRoutes);

routes.use(authRoutes);

export default routes ;