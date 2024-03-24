import { CartItem, OrderType, Product, ShippingInfo,Line, User, Stats, Pie, Bar } from "./types";


//Custom error Type
export type customError = {
    status: number,
    data: {
        message: string,
        success: boolean
    }
}


//Response types
export type MesssageResponse = {
    success: boolean;
    message: string;
}

export type AllUsersResponse = {
    success: boolean;
    users: User[];
}
export type UserResponse = {
    success: boolean,
    user: User,
}
export type productsResponse = {
    success: boolean,
    products: Product[],
}
export type productsdetailResponse = {
    success: boolean,
    product: Product,
}
export type CategoriesResponse = {
    success: boolean,
    categories: string[]
}

export type SearchProductsResponse = {
    success: boolean,
    products: Product[],
    totalPage: number,
}
export type AllordersResponse = {
    success: boolean,
    orders: OrderType[],
}
export type OrderDetailResponse = {
    success: boolean,
    order: OrderType,
}
export type StatsResponse = {
    success: boolean,
    stats: Stats,
}
export type PieResponse = {
    success: boolean,
    charts: Pie,
}
export type BarResponse = {
    success: boolean,
    charts: Bar,
}
export type LineResponse = {
    success: boolean,
    charts: Line,
}


//Requests types
export type SearchProductsRequest = {
    price: number,
    page: number,
    category: string,
    search: string,
    sort: string,
}

export type newProductRequest = {
    id: string,
    formData: FormData,
}


export type updateProductRequest = {
    userId: string,
    productId: string,
    formData: FormData,
}

export type deleteProductRequest = {
    userId: string,
    productId: string,
}

export type NewOrderRequest = {
    shippingInfo: ShippingInfo;
    orderItems: CartItem[];
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    user: string;
}
export type updateOrderRequest = {
    orderId: string,
    userId: string;
}
export type DeleteUserRequest = {
    userId: string;
    adminUserId: string
}

