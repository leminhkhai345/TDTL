// src/Components/FilterBar.jsx
import React, { useState } from "react";

const FilterBar = ({ onFilterChange }) => {
  const [genre, setGenre] = useState("All Genres");
  const [price, setPrice] = useState("All Prices");

  const handleGenreChange = (e) => {
    const selected = e.target.value;
    setGenre(selected);
    onFilterChange(selected, price);
  };

  const handlePriceChange = (e) => {
    const selected = e.target.value;
    setPrice(selected);
    onFilterChange(genre, selected);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <select
        value={genre}
        onChange={handleGenreChange}
        className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option>All Genres</option>
        <option>Classic</option>
        <option>Dystopian</option>
        <option>Fiction</option>
        <option>Romance</option>
        <option>Sci-Fi</option>
      </select>

      <select
        value={price}
        onChange={handlePriceChange}
        className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option>All Prices</option>
        <option>Under $10</option>
        <option>$10 - $20</option>
        <option>$20 - $30</option>
      </select>
    </div>
  );
};

export default FilterBar;
