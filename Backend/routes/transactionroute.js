const express = require("express");
const {
  initializeDatabase,
  getTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData,
} = require("../controller/transactionController");

const router = express.Router();

router.get("/initialize", initializeDatabase);
router.get("/transactions", getTransactions);
router.get("/statistics", getStatistics);
router.get("/bar-chart", getBarChart);
router.get("/pie-chart", getPieChart);
router.get("/combined", getCombinedData);

module.exports = router;
