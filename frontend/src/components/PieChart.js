import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";


const PieChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/pie-chart");
        const labels = data.map((item) => item.category);
        const values = data.map((item) => item.total);
        setChartData({
          labels,
          datasets: [
            {
              label: "Categories",
              data: values,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching pie chart data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: "300px", height: "300px", margin: "auto" }}>
      <h1 style={{marginLeft: "25%"}}>Pie Chart</h1>
      {chartData ? (
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      ) : (
        <p>Loading...</p>
      )}
      <br></br>
    </div>
  );
};

export default PieChart;
