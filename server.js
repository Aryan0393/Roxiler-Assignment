const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mernChallenge";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

const TransactionSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    category: String,
    sold: Boolean,
    dateOfSale: String
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

app.get("/api/initialize", async (req, res) => {
    try {
        const response = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");
        await Transaction.deleteMany();
        await Transaction.insertMany(response.data);
        res.json({ message: "Database initialized with transaction data." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/transactions", async (req, res) => {
    const { month, search, page = 1, perPage = 10 } = req.query;
    try {
        let query = {};
        if (month) query.dateOfSale = { $regex: new RegExp(`-${month}-`, "i") };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { price: { $regex: search, $options: "i" } },
            ];
        }
        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
