import { NextFunction, Request, Response } from "express";
import { tryCatch } from "../middlewares/error";
import { baseQueryType, newProductRequest, searchRequestQuery } from "../types/types";
import { Product } from "../models/product";
import errorHandler from "../utils/utility-class";
import { rm } from "fs";
import { mycache } from "../app";
import { inValidateCache } from "../utils/features";

// Revalidate on new Product add, update or delete
// caching should be destroyed in above of the cases
export const getLatestProducts = tryCatch(
    async (req, res, next) => {

        let products;
        if (mycache.has('latest-products'))
            products = JSON.parse(mycache.get('latest-products') as string);
        else {
            products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
            mycache.set('latest-products', JSON.stringify(products));
        }

        return res.status(200).json({
            success: true,
            products
        })
    })

// Revalidate on new Product add, update or delete
// caching should be destroyed in above of the cases
export const getAllCategories = tryCatch(
    async (req, res, next) => {

        let categories;
        if (mycache.has('categories'))
            categories = JSON.parse(mycache.get('categories') as string);
        else {
            categories = await Product.distinct('category')
            mycache.set('categories', JSON.stringify(categories))
        }
        return res.status(200).json({
            success: true,
            categories
        })
    })

export const getAdminProducts = tryCatch(
    async (req, res, next) => {

        let products;
        if (mycache.has('all-products'))
            products = JSON.parse(mycache.get('all-products') as string);
        else {
            products = await Product.find({});
            mycache.set('all-products', JSON.stringify(products));
        }

        return res.status(200).json({
            success: true,
            products
        })
    })

export const getSingleProduct = tryCatch(
    async (req, res, next) => {

        let product;
        const id = req.params.id;
        if (mycache.has(`product-${id}`)) {
            product = JSON.parse(mycache.get(`product-${id}`) as string)
        }
        else {
            product = await Product.findById(req.params.id);
            if (!product) return next(new errorHandler('Product Not Found!', 404))
            mycache.set(`product-${id}`, JSON.stringify(product))
        }
        return res.status(200).json({
            success: true,
            product
        })
    })

export const newProduct = tryCatch(
    async (req: Request<{}, {}, newProductRequest>, res, next) => {
        const { name, price, category, stock } = req.body;
        const photo = req.file;

        if (!photo) return next(new errorHandler('Please add photo', 401));

        if (!name || !category || !price || !stock) {
            rm(photo.path, () => {
                console.log('deleted')
            })
            return next(new errorHandler('Please add details of the Product', 401))
        }

        await Product.create({
            name, price, category: category.toLowerCase(), stock,
            photo: photo.path
        })

        inValidateCache({ product: true, admin: true })

        return res.status(201).json({
            success: true,
            message: 'Product created successfully!!'
        })
    })

export const updateProduct = tryCatch(
    async (req, res, next) => {

        const id = req.params.id;
        const { name, price, category, stock } = req.body;
        const photo = req.file;

        const product = await Product.findById(id)
        if (!product) return next(new errorHandler('product not found', 404))


        if (photo) {
            rm(product.photo!, () => {
                console.log('Old photo deleted');
            })
            product.photo = photo.path
        }

        if (name) product.name = name;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (category) product.category = category;
        await product.save();
        inValidateCache({ product: true, admin: true, productId: String(product._id) })

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully!!'
        })
    })

export const deleteSingleProduct = tryCatch(
    async (req, res, next) => {

        const product = await Product.findById(req.params.id);
        if (!product) return next(new errorHandler('Product Not found', 404))

        rm(product.photo!, () => {
            console.log('Product photo deleted')
        })

        await product.deleteOne();
        inValidateCache({ product: true, admin: true, productId: String(product._id) })

        return res.status(200).json({
            success: true,
            message: 'Product Deleted successfully!'
        })
    })

export const getAllProducts = tryCatch(
    async (req: Request<{}, {}, {}, searchRequestQuery>, res, next) => {

        const { category, search, price, sort } = req.query;

        const page = Number(req.query.page) || 1;

        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = limit * (page - 1);

        const baseQuery: baseQueryType = {}

        if (search) baseQuery.name = {
            $regex: search,
            $options: "i",
        };

        if (price) baseQuery.price = {
            $lte: Number(price),
        };

        if (category) baseQuery.category = category;

        const [products, allProduct] = await Promise.all([
            Product.find(baseQuery)
                .sort(sort && { price: sort === 'asc' ? 1 : -1 })
                .limit(limit)
                .skip(skip),
            Product.find(baseQuery)
        ])

        const totalPages = Math.ceil(allProduct.length / limit);
        return res.status(200).json({
            success: true,
            products,
            totalPages
        })
    })