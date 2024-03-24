import mongoose, { Document } from "mongoose"
import { inValidateCacheProps, orderItemType } from "../types/types";
import { mycache } from "../app";
import { Product } from "../models/product";

export const conntoDB = () => {
    mongoose.connect(process.env.MONGODB_URI as string, {
        dbName: 'Ecommerce_app_2024'
    }).then((c) => console.log(`DB connected`))
        .catch((e) => console.log(e));
}

export const inValidateCache = ({ product, order, admin, userId, orderId, productId }: inValidateCacheProps) => {

    if (product) {
        const productKeys: string[] = ['latest-products', 'categories', 'all-products'];
        if (typeof productId === "string") productKeys.push(`product-${productId}`)

        if (typeof productId === "object") productId.forEach(i => {
            productKeys.push(`product-${i}`)
        });
        mycache.del(productKeys);
    }
    if (order) {

        const orderKeys: string[] = ['all-orders', `my-orders-${userId}`, `order-${orderId}`]

        mycache.del(orderKeys)
    }

    if (admin) {
        mycache.del(["admin-stats", "admin-pie-charts", "admin-bar-charts", "admin-line-charts"])
    }

}

export const reduceStock = async (orderItems: orderItemType[]) => {

    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i]
        const product = await Product.findById(order.productId)

        if (!product)
            throw new Error('Product Not Found!')

        product.stock -= order.quantity;

        await product.save();
    }

}

export const calcPercentage = (thisMonth: number, lastMonth: number) => {

    if (lastMonth === 0) return thisMonth * 100;
    const percent = (thisMonth * 100) / lastMonth;
    return Number(percent.toFixed(0));
}

export const getInventories = async ({ categories, productsCount }: { categories: string[]; productsCount: number }) => {

    const categoriesCountPromise = categories.map(category => Product.countDocuments({ category }))

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = []

    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productsCount) * 100),
        })
    });

    return categoryCount;
}

interface MyDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
}

type funcProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;
    property?: "discount" | "total";
}

export const getChartData = ({ length, docArr, today, property }: funcProps) => {

    const data: number[] = new Array(length).fill(0);

    docArr.forEach(i => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            if (property)
                data[length - monthDiff - 1] += i[property]!;
            else {
                data[length - monthDiff - 1] += 1;
            }
        }
    })
    // console.log(data)

    return data;
}

