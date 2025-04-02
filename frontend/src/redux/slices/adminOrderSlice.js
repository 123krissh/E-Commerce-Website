import { createSlice, createAsyncThunk, __DO_NOT_USE__ActionTypes } from "@reduxjs/toolkit";
import axios from "axios";
import { act } from "react";

// Fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk("adminOrders/fetchAllOrders", async (__, {rejectWithValue}) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// update order delivery status
export const updateOrderStatus = createAsyncThunk("adminOrders/updateOrderStatus", async ({id, status}, {rejectWithValue}) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`, {status}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Delete an order
export const deleteOrder = createAsyncThunk("adminOrders/deleteOrder", async (id, {rejectWithValue}) => {
    try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
        });
        return id;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const adminOrderSlice = createSlice({
    name: "adminOrders",
    initialState: {
        orders: [],
        totalSales: 0,
        totalOrders: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        // Fetch all orders
        .addCase(fetchAllOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAllOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.totalOrders = action.payload.length;

            // calculate total sales
            const totalSales = action.payload.reduce((acc, order) => {
                return acc + order.totalPrice;
            }, 0);
            state.totalSales = totalSales;
        })
        .addCase(fetchAllOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        })
        // Update Order Status
        .addCase(updateOrderStatus.fulfilled, (state, action) => {
            const updatedOrder = action.payload;
            const orderIndex = state.orders.findIndex(
                (order) => order._id === updatedOrder._id
            );
            if(orderIndex !== -1) {
                state.orders[orderIndex] = updatedOrder;
            }
        })
        // Delete Order
        .addCase(deleteOrder.fulfilled, (state, action) => {
            state.orders = state.orders.filter(
                (order) => order._id !== action.payload
            );
        });
    },
});

export default adminOrderSlice.reducer;




// DO_NOT_USE__ActionTypes