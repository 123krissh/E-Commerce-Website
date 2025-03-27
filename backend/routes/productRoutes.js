const express = require("express");
const Product = require("../models/Product");
const {protect, admin} = require("../middleware/authMiddleware");
const { route } = require("./productRoutes");

const router = express.Router();

// @route POST /api/products
// @desc Create a new Product
// @access Private/Admin
router.post("/", protect, admin, async (req, res) => {
    try {
        const { name, description, price, discountPrice, countInStock, category, sizes, collections, material, images, isFeatured, isPublished, tags, dimensions, weight, sku,} = req.body;
        const product = new Product({
            name, description, price, discountPrice, countInStock, category, sizes, collections, material, images, isFeatured, isPublished, tags, dimensions, weight, sku,
            // Reference to the admin user who created it
            user: req.user._id,
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route PUT /api/products/:id
// @desc update an existing product ID
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const { name, description, price, discountPrice, countInStock, category, sizes, collections, material, images, isFeatured, isPublished, tags, dimensions, weight, sku,} = req.body;

        // find product by ID
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.sizes = sizes || product.sizes;
            product.collections = collections || product.collections;
            product.material = material || product.material;
            product.images = images || product.images;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.dimensions = dimensions || product.dimensions;
            product.weight = weight || product.weight;
            product.sku = sku || product.sku;


            // save the updated product
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({message: "Product not found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route DELETE /api/products/:id
// @desc delete a product by ID
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        // Find the product by ID
        const product = await Product.findById(req.params.id);

        if(product) {
            // Remove the product from DB
            await product.deleteOne();
            res.json({message: "Product Removed"});
        } else {
            res.status(404).json({message: "Product not found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route GET /api/products
// @desc get all products with optional query filters
// @access public
router.get("/", async (req, res) => {
    try {
        const {collection, size, minPrice, maxPrice, sortBy, search, category, material, limit} = req.query;

        let query = {};

        // Filter logic
        if(collection && collection.toLocaleLowerCase() !== "all") {
            query.collections = collection;
        }

        if(category && category.toLocaleLowerCase() !== "all") {
            query.category = category;
        }

        if(material) {
            query.material = { $in: material.split(",")};
        }

        if(size) {
            query.size = { $in: size.split(",")};
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if(minPrice) query.price.$gte = Number(minPrice);
            if(maxPrice) query.price.$lte = Number(maxPrice);
        }

        if(search) {
            query.$or = [
                {name: {$regex: search, $options: "i"}},
                {description: {$regex: search, $options: "i"}},
            ];
        }

        // Sort Logic
        let sort = {};
        if(sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = {price: 1};
                    break;
                case "priceDesc":
                    sort = {price: -1};
                    break; 
                case "popularity":
                    sort = {rating: -1};
                    break;
                default:
                    break;           
            }
        }

        // Fetch products and apply sorting and limit
        let products = await Product.find(query)
           .sort(sort)
           .limit(Number(limit) || 0);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route GET /api/products/:id
// @desc get a single product by ID
// @access public
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product) {
            res.json(product);
        } else {
            res.status(404).json({message: "Product Not Found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route GET /api/products/similar/:id
// @desc Retrieve similar products based on the current product's category
// @access public
router.get("/similar/:id", async (req, res) => {
    const {id} = req.params;
    console.log(id); 
});

module.exports = router;