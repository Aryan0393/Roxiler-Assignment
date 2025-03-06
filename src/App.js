import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const App = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalAmount: 0, soldItems: 0, unsoldItems: 0 });
    const [barChartData, setBarChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [search, setSearch] = useState("");
    const [month, setMonth] = useState("March");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchTransactions();
        fetchSummary();
    }, [month, search, page]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/transactions?month=${month}&search=${search}&page=${page}&perPage=10`
            );
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/summary?month=${month}`);
            setStats(response.data.stats);
            setBarChartData(response.data.barChart);
            setPieChartData(response.data.pieChart);
        } catch (error) {
            console.error("Error fetching summary data:", error);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Transactions Dashboard</h2>
            <label> Select Month: </label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>
            <input
                type="text"
                placeholder="Search Transactions"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginLeft: "10px" }}
            />
            <h3>Transactions</h3>
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                        <th>Date of Sale</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((txn) => (
                        <tr key={txn.id}>
                            <td>{txn.id}</td>
                            <td>{txn.title}</td>
                            <td>{txn.description}</td>
                            <td>${txn.price}</td>
                            <td>{txn.category}</td>
                            <td>{txn.sold ? "Yes" : "No"}</td>
                            <td>{txn.dateOfSale}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: "10px" }}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                <button onClick={() => setPage(page + 1)}>Next</button>
            </div>
            <h3>Statistics for {month}</h3>
            <p><strong>Total Sales:</strong> ${stats.totalAmount}</p>
            <p><strong>Sold Items:</strong> {stats.soldItems}</p>
            <p><strong>Unsold Items:</strong> {stats.unsoldItems}</p>
            <div className="chart-container">
    <h3>Price Range Distribution</h3>
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barChartData}>
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
    </ResponsiveContainer>
</div>

<div className="chart-container">
    <h3>Category Distribution</h3>
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie
                data={pieChartData}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label
            >
                {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
         </div>
        </div>
    );
};

export default App;
