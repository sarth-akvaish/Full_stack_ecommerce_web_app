import { Request } from "express";
import { tryCatch } from "../middlewares/error";
import { newOrderRequest } from "../types/types";
import { Order } from "../models/order";
import { inValidateCache, reduceStock } from "../utils/features";
import errorHandler from "../utils/utility-class";
import { mycache } from "../app";

export const myOrders = tryCatch(
    async (req, res, next) => {

        const { id: user } = req.query;
        let orders = [];
        const key = `my-orders-${user}`

        if (mycache.has(key)) orders = JSON.parse(mycache.get(key) as string)
        else {
            orders = await Order.find({ user })
            mycache.set(key, JSON.stringify(orders))
        }
        return res.status(200).json({
            success: true,
            orders,
        })
    })

export const allOrders = tryCatch(
    async (req, res, next) => {

        const key = `all-orders`;
        let orders = [];

        if (mycache.has(key)) orders = JSON.parse(mycache.get(key) as string)
        else {
            orders = await Order.find().populate("user", "name");
            mycache.set(key, JSON.stringify(orders))
        }
        return res.status(200).json({
            success: true,
            orders,
        });
    });

export const getSingleOrder = tryCatch(
    async (req, res, next) => {

        const { id } = req.params;
        const key = `order-${id}`;
        let order;

        if (mycache.has(key)) order = JSON.parse(mycache.get(key) as string)
        else {
            order = await Order.findById(id).populate("user", "name");
            if (!order) return next(new errorHandler('Order Not Found', 404));
            mycache.set(key, JSON.stringify(order))
        }
        return res.status(200).json({
            success: true,
            order,
        });
    });

export const newOrder = tryCatch(
    async (req: Request<{}, {}, newOrderRequest>, res, next) => {

        const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total } = req.body;

        if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
            return next(new errorHandler('Please enter all details', 400))

        const order = await Order.create({ shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total });

        await reduceStock(orderItems);
        inValidateCache({
            product: true,
            order: true,
            admin: true,
            userId: user,
            productId: order.orderItems.map(i => String(i.productId))
        });

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully!!'
        })
    })

export const processOrder = tryCatch(
    async (req, res, next) => {

        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return next(new errorHandler('Order not found!!', 404))

        switch (order.status) {
            case "Processing":
                order.status = "Shipped";
                break;
            case "Shipped":
                order.status = "Delivered";
                break;
            default:
                order.status = "Shipped";
                break;
        }

        await order.save();

        inValidateCache({
            product: false,
            order: true,
            admin: true,
            userId: order.user,
            orderId: String(order._id)
        });

        return res.status(200).json({
            success: true,
            message: 'Order processed successfully!!'
        })
    })

export const deleteOrder = tryCatch(
    async (req, res, next) => {

        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return next(new errorHandler('Order not found!!', 404))


        await order.deleteOne();

        inValidateCache({
            product: false,
            order: true,
            admin: true,
            userId: order.user,
            orderId: String(order._id)
        });

        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully!!'
        })
    })