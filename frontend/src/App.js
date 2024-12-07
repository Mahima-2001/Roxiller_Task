import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import TransactionTable from "./components/TransactionTable";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";
import Statistics from "./components/Statistics";

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(1); // Default to January
  const [year, setYear] = useState(2022); // Default to 2022
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  // Fetch transactions with the selected month, year, and search query
  const fetchTransactions = () => {
    console.log("Fetching transactions with search query:", searchQuery);
    axios
      .get("http://localhost:5000/api/transactions", {
        params: { search: searchQuery, month, year },
      })
      .then((response) => {
        console.log("Transactions fetched:", response.data.transactions); // Log fetched transactions
        setTransactions(response.data.transactions); // Set state with the fetched transactions
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
  };

  // Fetch transactions on month, year, or search query change
  useEffect(() => {
    fetchTransactions(); // Trigger fetch whenever month, year, or search query changes
  }, [month, year, searchQuery]);

  return (
    <div>
      <div className="App">
        <div className="circle-header">
          <h1>Transaction Dashboard</h1>
        </div>
      </div>

      <SearchBar onSearch={(query) => setSearchQuery(query)} /> {/* Pass the search query to update state */}

      {/* Month and Year selection */}
      <div>
        <label>Month:</label>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
        >
          <option value={1}>January</option>
          <option value={2}>February</option>
          <option value={3}>March</option>
          <option value={4}>April</option>
          <option value={5}>May</option>
          <option value={6}>June</option>
          <option value={7}>July</option>
          <option value={8}>August</option>
          <option value={9}>September</option>
          <option value={10}>October</option>
          <option value={11}>November</option>
          <option value={12}>December</option>
        </select>

        <label>Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        />
      </div>

      {/* Transaction table and charts */}
      <TransactionTable transactions={transactions} />
      <BarChart transactions={transactions} month={month} year={year} />
      
      <div className="pie-chart-container">
        <div className="pie-chart">
          <PieChart month={month} year={year} /><br></br>
        </div>
      </div><br></br>

      <Statistics month={month} year={year} />
    </div>
  );
};

export default App;
