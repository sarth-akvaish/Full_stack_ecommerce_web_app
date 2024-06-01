import express from 'express'
import userRoute from './routes/user.js'
import productRoute from './routes/product.js'
import orderRoute from './routes/order.js'
import paymentRoute from './routes/payment.js'
import statsRoute from './routes/stats.js'
import { conntoDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
import NodeCache from 'node-cache';
import { config } from 'dotenv';
import morgan from 'morgan';
import cors from 'cors'
import Stripe from 'stripe'

config();

const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: process.env.WEB_APP_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'))

conntoDB();

export const stripe = new Stripe(process.env.STRIPE_KEY as string)
export const mycache = new NodeCache();

app.get('/', (req, res) => {
    res.send("API working !!");
})
app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/order', orderRoute);
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/dashboard', statsRoute);
app.use('/health',(req,res)=>{
    res.status(200).json("Health check endpoint");
})

app.use('/uploads', express.static('uploads'))
app.use(errorMiddleware);


app.listen(PORT, () => {
    console.log(`Server is listening on PORT : ${PORT}`)
})
