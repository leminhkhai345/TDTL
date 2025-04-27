// src/Components/FilterBar.jsx
import React, { useState } from "react";

const FilterBar = ({ onFilterChange }) => {
  const [genre, setGenre] = useState("All Genres");
  const [price, setPrice] = useState("All Prices");

  const genres = [
    "All Genres",
    "Classic",
    "Dystopian",
    "Fiction",
    "Romance",
    "Sci-Fi",
    "Fantasy",
    "Adventure",
  ];
  const prices = ["All Prices", "Under $10", "$10 - $20", "$20 - $30"];

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
      <div className="flex flex-col">
        {/* <label className="text-sm font-medium text-gray-600 mb-1">Genre</label> */}
        <select
          value={genre}
          onChange={handleGenreChange}
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        {/* <label className="text-sm font-medium text-gray-600 mb-1">Price</label> */}
        <select
          value={price}
          onChange={handlePriceChange}
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {prices.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;