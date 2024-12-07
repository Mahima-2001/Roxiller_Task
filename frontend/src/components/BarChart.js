import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import axios from "axios";

const BarChart = ({ month, year }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/bar-chart", { params: { month, year } })
      .then((response) => setData(response.data))
      .catch((error) => console.error("Error fetching bar chart data:", error));
  }, [month, year]);

  const chartData = {
    labels: data.map((item) => `Day ${item.day}`),
    datasets: [
      {
        label: "Sales",
        data: data.map((item) => item.totalSales),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default BarChart;