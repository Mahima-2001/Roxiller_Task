import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Statistics.css";

const Statistics = ({ month, year }) => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/statistics", {
        params: { month, year },
      });
      setStatistics(response.data);
    } catch (error) {
      setError("Failed to fetch statistics. Please try again.");
      console.error("Error fetching statistics:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (month && year) {
      fetchStatistics();
    }
  }, [month, year]);

  return (
    <div className="statistics-container">
      <h2>Statistics for {`${month}/${year}`}</h2>
      {loading ? (
        <p>Loading statistics...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : statistics.length > 0 ? (
        <table className="statistics-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {statistics.map((stat) => (
              <tr key={stat._id}>
                <td>{stat._id}</td>
                <td>{stat.totalSales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available for the selected month and year.</p>
      )}
    </div>
  );
};

export default Statistics;
