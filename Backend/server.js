require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const transactionsRoutes = require("./routes/transactionroute");

const app = express();


app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use("/api", transactionsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
