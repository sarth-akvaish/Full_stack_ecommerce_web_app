import { mycache } from "../app";
import { tryCatch } from "../middlewares/error";
import { Order } from "../models/order";
import { Product } from "../models/product";
import { User } from "../models/user";
import { calcPercentage, getChartData, getInventories } from "../utils/features";

export const getDashboardStats = tryCatch(async (req, res, next) => {

    let stats = {};
    const key = 'admin-stats';
    if (mycache.has(key))
        stats = JSON.parse(mycache.get(key) as string)
    else {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        }
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth() - 1, 0)
        }

        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        })

        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        })

        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        })

        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        })

        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        })

        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        })

        const lastSixMonthsOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            }
        })

        const latestTransactionPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);

        const [thisMonthProducts, thisMonthUsers, thisMonthOrders, lastMonthProducts, lastMonthUsers, lastMonthOrders, productsCount, usersCount, allOrders, lastSixMonthsOrders, categories, femaleUsersCount, lastestTransaction] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthsOrdersPromise,
            Product.distinct('category'),
            User.countDocuments({ gender: 'female' }),
            latestTransactionPromise
        ]);

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0)
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0)

        const percent = {
            revenue: calcPercentage(thisMonthRevenue, lastMonthRevenue),
            product: calcPercentage(thisMonthUsers.length, lastMonthUsers.length),
            user: calcPercentage(thisMonthProducts.length, lastMonthProducts.length),
            order: calcPercentage(thisMonthOrders.length, lastMonthOrders.length)
        }

        const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0)

        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length,
        }

        const orderMonthCount = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);

        lastSixMonthsOrders.forEach(order => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

            if (monthDiff < 6) {
                orderMonthCount[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        })

        const categoryCount = await getInventories({ categories, productsCount });

        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount,
        }

        const modifiedTransaction = lastestTransaction.map(i => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status,
        }))
        stats = {
            userRatio,
            categoryCount,
            percent,
            count,
            chart: {
                order: orderMonthCount,
                Revenue: orderMonthlyRevenue
            },
            lastestTransaction: modifiedTransaction,
        };

        mycache.set(key, JSON.stringify(stats));


    }
    return res.status(200).json({
        success: true,
        stats,
    })
})

export const getPieStats = tryCatch(async (req, res, next) => {

    let charts;
    const key = 'admin-pie-charts';
    if (mycache.has(key))
        charts = JSON.parse(mycache.get(key) as string);
    else {

        const [processingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            productsOutOfStock,
            allOrders,
            allUsers,
            adminUsersCount,
            customerUsersCount,
        ] =
            await Promise.all([
                Order.countDocuments({ status: 'Processing' }),
                Order.countDocuments({ status: 'Shipped' }),
                Order.countDocuments({ status: 'Delivered' }),
                Product.distinct("category"),
                Product.countDocuments(),
                Product.countDocuments({ stock: 0 }),
                Order.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges"]),
                User.find({}).select(["dob"]),
                User.countDocuments({ role: 'admin' }),
                User.countDocuments({ role: 'user' }),
            ])

        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
        }

        const productCategories = await getInventories({ categories, productsCount });

        const stockAvailability = {
            inStock: productsCount - productsOutOfStock,
            outOfStock: productsOutOfStock,
        }

        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0)

        const grossDiscount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0)

        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0)

        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0)

        const marketingCost = Math.round(grossIncome * 0.3);

        const netMargin = grossIncome - grossDiscount - productionCost - burnt - marketingCost;


        const revenueDistribution = {
            netMargin,
            grossDiscount,
            productionCost,
            burnt,
            marketingCost,
        }

        const adminCustomer = {
            admin: adminUsersCount,
            customer: customerUsersCount
        }

        const usersAgeGroup = {
            teen: allUsers.filter(i => i.age < 20).length,
            adult: allUsers.filter(i => i.age >= 20 && i.age < 45).length,
            old: allUsers.filter(i => i.age >= 45).length,
        }

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer,
        }

        mycache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    });

})

export const getBarStats = tryCatch(async (req, res, next) => {

    let charts;
    const key = 'admin-bar-charts';

    if (mycache.has(key)) {
        charts = JSON.parse(mycache.get(key) as string);
    }
    else {
        const today = new Date();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const SixMonthProductPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            }
        }).select("createdAt");

        const SixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            }
        }).select("createdAt");

        const twelveMonthsOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            }
        }).select("createdAt");

        const [products, users, orders] = await Promise.all([
            SixMonthProductPromise,
            SixMonthUsersPromise,
            twelveMonthsOrdersPromise,
        ])

        const productCounts = getChartData({ length: 6, today, docArr: products })
        const userCounts = getChartData({ length: 6, today, docArr: users })
        const orderCounts = getChartData({ length: 12, today, docArr: orders })
        charts = {
            users: userCounts,
            products: productCounts,
            orders: orderCounts,
        }
        mycache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    });

})

export const getLineStats = tryCatch(async (req, res, next) => {
    let charts;
    const key = 'admin-line-charts';

    if (mycache.has(key)) {
        charts = JSON.parse(mycache.get(key) as string);
    }
    else {
        const today = new Date();

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            }
        }

        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            User.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"]),
        ])

        const productCounts = getChartData({ length: 12, today, docArr: products })
        const userCounts = getChartData({ length: 12, today, docArr: users })
        const discount = getChartData({ length: 12, today, docArr: orders, property: 'discount' })
        const revenue = getChartData({ length: 12, today, docArr: orders, property: 'total' })
        charts = {
            users: userCounts,
            products: productCounts,
            discount,
            revenue,
        }
        mycache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts,
    });


})