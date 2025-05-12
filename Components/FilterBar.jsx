import React, { useState } from 'react';

const FilterBar = ({ categories, onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');

  const prices = ['All Prices', '1-2', '2-4', 'Above 4'];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    onFilterChange(e.target.value, selectedPrice);
  };

  const handlePriceChange = (e) => {
    setSelectedPrice(e.target.value);
    onFilterChange(selectedCategory, e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="p-3 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
      >
        <option value="All Categories">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select
        value={selectedPrice}
        onChange={handlePriceChange}
        className="p-3 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
      >
        {prices.map((price) => (
          <option key={price} value={price}>
            {price}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;