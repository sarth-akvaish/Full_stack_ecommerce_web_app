import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CategoriesResponse, deleteProductRequest, MesssageResponse, newProductRequest, productsdetailResponse, productsResponse, SearchProductsRequest, SearchProductsResponse, updateProductRequest } from "../../types/api-types";

export const productAPI = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/product/` }),
    tagTypes: ["product"],
    endpoints: (builder) => ({
        latestProducts: builder.query<productsResponse, string>({
            query: () => "latest",
            providesTags: ["product"]
        }),
        allProducts: builder.query<productsResponse, string>({
            query: (id) => `admin-products?id=${id}`,
            providesTags: ["product"]
        }),
        categories: builder.query<CategoriesResponse, string>({
            query: () => `categories`,
            providesTags: ["product"]
        }),
        searchProducts: builder.query<SearchProductsResponse, SearchProductsRequest>({
            query: ({ price, search, sort, category, page }) => {
                let base = `all?search=${search}&page=${page}`

                if (price) base += `&price=${price}`
                if (category) base += `&category=${category}`
                if (sort) base += `&sort=${sort}`
                return base;
            },
            providesTags: ["product"]
        }),
        productDetails: builder.query<productsdetailResponse, string>({
            query: (id) => id,
            providesTags: ["product"]
        }),
        newProducts: builder.mutation<MesssageResponse, newProductRequest>({
            query: ({ formData, id }) => ({
                url: `new?id=${id}`,
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ["product"]
        }),
        updateProduct: builder.mutation<MesssageResponse, updateProductRequest>({
            query: ({ formData, userId, productId }) => ({
                url: `${productId}?id=${userId}`,
                method: 'PUT',
                body: formData
            }),
            invalidatesTags: ["product"]
        }),
        deleteProduct: builder.mutation<MesssageResponse, deleteProductRequest>({
            query: ({ userId, productId }) => ({
                url: `${productId}?id=${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["product"]
        }),
    }),
})

export const { useLatestProductsQuery, useDeleteProductMutation, useUpdateProductMutation, useProductDetailsQuery, useNewProductsMutation, useSearchProductsQuery, useCategoriesQuery, useAllProductsQuery } = productAPI;