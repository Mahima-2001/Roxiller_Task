const axios = require("axios");
const Transaction = require("../models/TransationModel");

// Initialize database with third-party API data
const initializeDatabase = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );

    await Transaction.deleteMany(); // Clear old data
    await Transaction.insertMany(data);

    res.status(200).json({ message: "Database initialized successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Fetch transactions with search and pagination
const getTransactions = async (req, res) => {
  const { search = "", month = "", year = "", page = 1, perPage = 10 } = req.query;

  const pageNum = parseInt(page);
  const perPageNum = parseInt(perPage);

  const filter = {};

  // Filter by month and year if provided
  if (month) {
    const startDate = new Date(`${year || new Date().getFullYear()}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Get the next month

    filter.dateOfSale = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  // Filter by year if provided
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    filter.dateOfSale = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  // Search by title if provided
  if (search) {
    filter.title = { $regex: search, $options: "i" }; // Case-insensitive search
  }

  try {
    const transactions = await Transaction.find(filter)
      .skip((pageNum - 1) * perPageNum)
      .limit(perPageNum);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      total,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};


// Fetch statistics for the selected month
const getStatistics =  async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required." });
  }

  try {
    const statistics = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(`${year}-${month}-01`),
            $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSales: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(statistics);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};



// Fetch bar chart data for the selected month
const getBarChart = async (req, res) => {
  try {
    const barChartData = await Transaction.aggregate([
      {
        $group: {
          _id: { $month: "$dateOfSale" }, // Group by month from dateOfSale
          totalSales: { $sum: 1 }, // Count the number of transactions
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month in ascending order
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalSales: 1,
        },
      },
    ]);

    // If no data, send an empty array
    if (barChartData.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(barChartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Fetch pie chart data for the selected month
const getPieChart = async (req, res) => {
    try {
      const pieChartData = await Transaction.aggregate([
        {
          $group: {
            _id: "$category", // Group by category
            total: { $sum: 1 }, // Count the number of items in each category
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            total: 1,
          },
        },
      ]);
  
      // If no data, send an empty array
      if (pieChartData.length === 0) {
        return res.status(200).json([]);
      }
  
      res.status(200).json(pieChartData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  

// Combine all API data
const getCombinedData = async (req, res) => {
    try {
      // Extract month and year from query parameters
      const { month, year } = req.query;
  
      // Validate month and year
      if (!month || !year) {
        return res.status(400).json({
          error: "Month and year are required",
        });
      }
  
      const numericMonth = parseInt(month);
      const numericYear = parseInt(year);
  
      if (
        isNaN(numericMonth) ||
        isNaN(numericYear) ||
        numericMonth < 1 ||
        numericMonth > 12
      ) {
        return res.status(400).json({
          error: "Invalid month or year",
        });
      }
  
      // Filter data by month and year
      const startOfMonth = new Date(numericYear, numericMonth - 1, 1);
      const endOfMonth = new Date(numericYear, numericMonth, 0);
  
      // Pie Chart Data: Group by category within the month
      const pieChartData = await Transaction.aggregate([
        {
          $match: {
            dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: "$category",
            totalSales: { $sum: 1 },
          },
        },
        {
          $project: {
            category: "$_id",
            totalSales: 1,
            _id: 0,
          },
        },
      ]);
  
      // Bar Chart Data: Sales grouped by day in the specified month
      const barChartData = await Transaction.aggregate([
        {
          $match: {
            dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$dateOfSale" },
            totalSales: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            day: "$_id",
            totalSales: 1,
            _id: 0,
          },
        },
      ]);
  
      // Total Statistics: Summary for the given month and year
      const totalStatistics = await Transaction.aggregate([
        {
          $match: {
            dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$price" },
            totalProducts: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            totalSales: 1,
            totalProducts: 1,
          },
        },
      ]);
  
      // Combine all data
      res.status(200).json({
        pieChartData,
        barChartData,
        totalStatistics: totalStatistics[0] || { totalSales: 0, totalProducts: 0 },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};


module.exports = {
  initializeDatabase,
  getTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData,
};
