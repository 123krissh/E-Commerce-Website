import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async Thunk to fetch Products by Collection and optional Filters
export const fetchProductsByFilters = createAsyncThunk("products/fetchByFilters", 
    async({
        collection, size, minPrice, maxPrice, sortBy, search, category, material, limit,
    }) => {
        const query = new URLSearchParams();
        if(collection) query.append("collection", collection);
        if (size) query.append("size", size);
        if (minPrice) query.append("minPrice", minPrice);
        if (maxPrice) query.append("maxPrice", maxPrice);
        if (sortBy) query.append("sortBy", sortBy);
        if (search) query.append("search", search);
        if (category) query.append("category", category);
        if (material) query.append("material", material);
        if (limit) query.append("limit", limit);

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`
        );
        return response.data;
    }
);

//Async thunck to fetch a single product by id

export const fetchProductDetails = createAsyncThunk(
    "products/fetchProductDetails",
    async (id) => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
      );
      return response.data; 
    }
  );
// Create Product
  // export const createProduct = createAsyncThunk(
  //   "products/createProduct",
  //   async (formData, { rejectWithValue }) => {
  //     try {
  //       const config = {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  //         },
  //       };
  //       const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/products`, formData, config);
  //       return data;
  //     } catch (error) {
  //       return rejectWithValue(error.response?.data?.message || "Something went wrong");
  //     }
  //   }
  // );
  
  // Async thunk to fetch similar products
  export const updateProduct = createAsyncThunk(
    "products/updateProduct",
    async ({id, productData}) => { 
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    }
  );
  
  //Async thunk to fetch similar products
  export const fetchSimilarProducts = createAsyncThunk(
    "products/fetchSimilarProducts",
    async ({id}) => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/similar/${id}`
      );
      return response.data;
    }
  );
  
  const productsSlice = createSlice({
    name: "products",
    initialState: {
      products: [],
      selectedProduct: null,
      similarProducts: [],
      loading: false,
      error: null,
      filters: {
        category: "",
        size: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "",
        search: "",
        material: "",
        collection: "",
      },
    },
    reducers: {
      setFilters: (state, action) => {
        state.filters = { ...state.filters, ...action.payload };
      },
      clearFilters: (state) => {
        state.filters = {
          category: "",
          size: "",
          minPrice: "",
          maxPrice: "",
          sortBy: "",
          search: "",
          material: "",
          collection: "",
        };
      },
    },
  
    extraReducers: (builder) => {
      builder
        //fetchProductsByFilters
        .addCase(fetchProductsByFilters.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
          state.loading = false;
          state.products = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(fetchProductsByFilters.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        })
        //fetchProductDetails
        .addCase(fetchProductDetails.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchProductDetails.fulfilled, (state, action) => {
          state.loading = false;
          state.selectedProduct = action.payload;
        })
        .addCase(fetchProductDetails.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        })
        // //Handle Create product
        // .addCase(createProduct.pending, (state) => {
        //   state.loading = true;
        // })
        // .addCase(createProduct.fulfilled, (state, action) => {
        //   state.loading = false;
        //   state.products = action.payload;
        // })
        // .addCase(createProduct.rejected, (state, action) => {
        //   state.loading = false;
        //   state.error = action.payload;
        // })
        //Handle updating product
        .addCase(updateProduct.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateProduct.fulfilled, (state, action) => {
          state.loading = false;
          const updatedProduct = action.payload;
          const index = state.products.findIndex(
            (product) => product._id === updatedProduct._id
          );
   
          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
        })
        .addCase(updateProduct.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        })
  
        //fetchsimilarproducts
        .addCase(fetchSimilarProducts.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
          state.loading = false;
          state.similarProducts = action.payload;
        })
        .addCase(fetchSimilarProducts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        });
    },
  });

  export const { setFilters, clearFilters } = productsSlice.actions;
  export default productsSlice.reducer;