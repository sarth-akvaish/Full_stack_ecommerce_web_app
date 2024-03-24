import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartReducerInitialState } from "../../types/reducer-types";
import { CartItem, ShippingInfo } from "../../types/types";

const initialState: CartReducerInitialState = {
    loading: false,
    cartItems: [],
    subtotal: 0,
    tax: 0,
    shippingCharges: 0,
    discount: 0,
    total: 0,
    shippingInfo: {
        address: "",
        city: "",
        state: "",
        country: "",
        pinCode: ""
    }
}

export const cartReducer = createSlice({
    name: 'cartReducer',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            state.loading = true;

            const index = state.cartItems.findIndex((i) => i.productId === action.payload.productId)
            if (index !== -1) state.cartItems[index] = action.payload;
            else state.cartItems.push(action.payload)
            state.loading = false;
        },
        removeCartItems: (state, action: PayloadAction<string>) => {
            state.cartItems = state.cartItems.filter(i => i.productId !== action.payload)
            state.loading = false;
        },
        calculatePrice: (state) => {
            const subtotal = state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

            state.subtotal = subtotal;
            state.shippingCharges = state.subtotal > 1000 ? 0 : 200;
            state.tax = Math.round(0.18 * state.subtotal)
            state.total = state.subtotal + state.shippingCharges + state.tax - state.discount;
        },
        applyDiscount: (state, action: PayloadAction<number>) => {
            state.discount = action.payload
        },
        saveShippingInfo: (state, action: PayloadAction<ShippingInfo>) => {
            state.shippingInfo = action.payload
        },
        resetCart: () => initialState,

    },
})

export const { applyDiscount, addToCart, resetCart, saveShippingInfo, removeCartItems, calculatePrice } = cartReducer.actions;