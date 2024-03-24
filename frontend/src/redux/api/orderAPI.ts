import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AllordersResponse, MesssageResponse, NewOrderRequest, OrderDetailResponse, updateOrderRequest } from "../../types/api-types";


export const orderAPI = createApi({
    reducerPath: 'orderApi',
    baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/order/` }),
    tagTypes: ["orders"],
    endpoints: (builder) => ({
        neworder: builder.mutation<MesssageResponse, NewOrderRequest>({
            query: (order) => ({
                url: 'new',
                method: 'POST',
                body: order
            }),
            invalidatesTags: ['orders']
        }),
        updateorder: builder.mutation<MesssageResponse, updateOrderRequest>({
            query: ({ userId, orderId }) => ({
                url: `${orderId}?id=${userId}`,
                method: 'PUT',
            }),
            invalidatesTags: ['orders']
        }),
        deleteorder: builder.mutation<MesssageResponse, updateOrderRequest>({
            query: ({ userId, orderId }) => ({
                url: `${orderId}?id=${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['orders']
        }),
        myOrders: builder.query<AllordersResponse, string>({
            query: (id) => `my?id=${id}`,
            providesTags: ["orders"],
        }),
        allOrders: builder.query<AllordersResponse, string>({
            query: (id) => `all?id=${id}`,
            providesTags: ["orders"],
        }),
        orderDetails: builder.query<OrderDetailResponse, string>({
            query: (id) => id,
            providesTags: ["orders"],
        }),
        
    }),
})

export const { useNeworderMutation, useUpdateorderMutation, useDeleteorderMutation, useMyOrdersQuery, useAllOrdersQuery, useOrderDetailsQuery } = orderAPI;