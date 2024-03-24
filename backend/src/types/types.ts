import { NextFunction, Request, Response } from "express";

export interface newUserRequest {
    _id: string,
    name: string,
    email: string,
    photo: string,
    gender: string,
    dob: Date,
}

export interface newProductRequest {
    name: string,
    category: string,
    price: number,
    stock: number,
}

export type controllerType = (
    req: Request,
    res: Response,
    next: NextFunction)
    => Promise<void | Response<any, Record<string, any>>>

export type searchRequestQuery = {
    search?: string,
    price?: string,
    category?: string,
    sort?: string,
    page?: string,
}

export interface baseQueryType {
    name?: {
        $regex: string;
        $options: string;
    };
    price?: {
        $lte: number;
    };
    category?: string;
}

export type inValidateCacheProps = {
    product?: boolean,
    order?: boolean,
    admin?: boolean,
    userId?: string,
    orderId?: string,
    productId?: string | string[],
}

export type orderItemType = {
    name: string,
    photo: string,
    price: number,
    quantity: number,
    productId: string,
}

export type shippingInfoType = {
    address: string,
    city: string,
    state: string,
    country: string,
    pinCode: number,
}

export interface newOrderRequest {
    shippingInfo: shippingInfoType,
    user: string,
    subtotal: number,
    tax: number,
    shippingCharges: number,
    discount: number,
    total: number,
    orderItems: orderItemType[]
}


// npm install && mkdir -p upload && npm run build 
