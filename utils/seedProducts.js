import mongoose from "mongoose";
import Product from "../models/productModel.js";
import dotenv from 'dotenv'

dotenv.config();

const products = [
  {
    name: "iPhone 15",
    price: 79999,
    description: "Apple smartphone with A16 Bionic chip.",
    stock_quantity: 15,
  },
  {
    name: "Samsung Galaxy S24",
    price: 74999,
    description: "Premium Android smartphone from Samsung.",
    stock_quantity: 20,
  },
  {
    name: "OnePlus 12",
    price: 64999,
    description: "Flagship smartphone with fast charging.",
    stock_quantity: 18,
  },
  {
    name: "MacBook Air M3",
    price: 114999,
    description: "Lightweight laptop powered by Apple M3 chip.",
    stock_quantity: 8,
  },
  {
    name: "Dell Inspiron 15",
    price: 58999,
    description: "Reliable laptop for students and professionals.",
    stock_quantity: 12,
  },
  {
    name: "HP Pavilion 14",
    price: 62999,
    description: "Performance laptop with modern design.",
    stock_quantity: 10,
  },
  {
    name: "Sony WH-1000XM5",
    price: 29999,
    description: "Noise-cancelling wireless headphones.",
    stock_quantity: 25,
  },
  {
    name: "JBL Tune 770NC",
    price: 8999,
    description: "Wireless headphones with active noise cancellation.",
    stock_quantity: 30,
  },
  {
    name: "Apple Watch Series 9",
    price: 41999,
    description: "Advanced smartwatch with health tracking.",
    stock_quantity: 14,
  },
  {
    name: "Samsung Galaxy Watch 6",
    price: 28999,
    description: "Feature-rich smartwatch for Android users.",
    stock_quantity: 16,
  },
  {
    name: "iPad Air",
    price: 59999,
    description: "Powerful tablet for work and entertainment.",
    stock_quantity: 11,
  },
  {
    name: "Logitech MX Master 3S",
    price: 9999,
    description: "Premium wireless productivity mouse.",
    stock_quantity: 35,
  },
  {
    name: "Mechanical Gaming Keyboard",
    price: 4999,
    description: "RGB mechanical keyboard for gamers.",
    stock_quantity: 28,
  },
  {
    name: "Amazon Echo Dot",
    price: 4499,
    description: "Smart speaker with Alexa voice assistant.",
    stock_quantity: 22,
  },
  {
    name: "Portable SSD 1TB",
    price: 7999,
    description: "High-speed external solid-state drive.",
    stock_quantity: 19,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    await Product.deleteMany();

    await Product.insertMany(products);

    console.log("Products seeded successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();

