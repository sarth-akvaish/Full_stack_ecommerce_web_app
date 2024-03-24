
export type User = {
    name: string;
    email: string;
    photo: string;
    gender: string;
    role: string;
    dob: string;
    _id: string;
}

export type Product = {
    name: string;
    _id: string;
    category: string,
    stock: number,
    photo: string,
    price: number
}

export type ShippingInfo = {
    address: string,
    city: string,
    state: string,
    country: string,
    pinCode: string,
}


export type CartItem = {
    productId: string,
    photo: string,
    name: string,
    price: number,
    quantity: number,
    stock: number
}

export type OrderItem = Omit<CartItem, "stock"> & { _id: string }

export type OrderType = {
    orderItems: OrderItem[];
    shippingInfo: ShippingInfo;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    status: string;
    _id: string,
    user: {
        name: string,
        _id: string,
    }
}

type percentAndCount = {
    revenue: number;
    product: number;
    user: number;
    order: number;
}
type LastestTransaction = {
    _id: string;
    amount: number;
    discount: number;
    quantity: number;
    status: string;
}
export type Stats = {
    userRatio: {
        male: number;
        female: number;
    },
    categoryCount: Record<string, number>[],
    percent: percentAndCount,
    count: percentAndCount,
    chart: {
        order: number[],
        Revenue: number[]
    },
    lastestTransaction: LastestTransaction[],
}
type RevenueDistribution = {
    netMargin: number;
    grossDiscount: number;
    productionCost: number;
    burnt: number;
    marketingCost: number;
}
type OrderFullfillment = {
    processing: number;
    shipped: number;
    delivered: number;
}
type UserAgeGroup = {
    teen: number;
    adult: number;
    old: number;
}
export type Pie = {
    orderFullfillment: OrderFullfillment,
    productCategories: Record<string, number>[],
    stockAvailability: {
        inStock: number;
        outOfStock: number;
    },
    revenueDistribution: RevenueDistribution,
    usersAgeGroup: UserAgeGroup,
    adminCustomer: {
        admin: number;
        customer: number;
    },
}
export type Bar = {
    users: number[],
    products: number[],
    orders: number[],
}
export type Line = {
    users: number[],
    products: number[],
    discount: number[],
    revenue: number[],
}