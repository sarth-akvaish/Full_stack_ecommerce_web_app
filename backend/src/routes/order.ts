import express from 'express'
import { adminOnly } from '../middlewares/auth';
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from '../controllers/order';

const app = express.Router();

app.post('/new', newOrder)

app.get('/my', myOrders);

app.get('/all', adminOnly, allOrders);

app.route('/:id')
    .get(getSingleOrder)
    .put(adminOnly, processOrder)
    .delete(adminOnly, deleteOrder)

export default app;