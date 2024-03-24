import { stripe } from "../app";
import { tryCatch } from "../middlewares/error";
import { Coupon } from "../models/coupon";
import errorHandler from "../utils/utility-class";

export const createPaymentIntent = tryCatch(async (req, res, next) => {

    const { amount, shipping, description } = req.body;

    if (!amount)
        return next(new errorHandler('Please enter amount', 400));

    const paymentIntent = await stripe.paymentIntents.create({
        description
            : 'Software development services',
        shipping
            : {
            name: 'Jenny Rosen',
            address: {
                line1: '510 Townsend St',
                postal_code: '98140',
                city: 'San Francisco',
                state: 'CA',
                country: 'US',
            },
        },
        amount: Number(amount) * 100,
        currency: 'inr',
    })

    return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret
    })
})

export const newCoupon = tryCatch(async (req, res, next) => {

    const { coupon, amount } = req.body;

    if (!coupon || !amount)
        return next(new errorHandler('Please enter both coupon and amount', 400));

    await Coupon.create({ code: coupon, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} created successfully !!`
    })
})

export const applyDiscount = tryCatch(async (req, res, next) => {

    const { coupon } = req.query;

    const discount = await Coupon.findOne({ code: coupon })

    if (!discount) {
        return next(new errorHandler('Invalid Coupon Code', 400));
    }

    return res.status(200).json({
        success: true,
        discount: discount.amount,
    })
})

export const allCoupons = tryCatch(async (req, res, next) => {

    const coupons = await Coupon.find({})

    if (!coupons) {
        return next(new errorHandler('No Coupons exist!!', 400));
    }

    return res.status(200).json({
        success: true,
        coupons,
    })
})

export const deleteCoupon = tryCatch(async (req, res, next) => {

    const { id } = req.params
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) return next(new errorHandler('Invalid coupon Id', 400));

    return res.status(200).json({
        success: true,
        message: `Coupon ${coupon?.code} deleted succesfully !!`
    })
})