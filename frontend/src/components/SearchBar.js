import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search clicked with query:", query); // Log the query to ensure it's being passed correctly
    onSearch(query); // Trigger the onSearch passed from the parent App component
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by description, category, or amount..."
        value={query}
        onChange={(e) => setQuery(e.target.value)} // Update local state on input change
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
