import React, { useState } from 'react';

const FilterBar = ({ onFilterChange }) => {
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');

  // Danh mục cứng cho người dùng thông thường, không liên quan đến Category Admin
  const genres = [
    'All Genres',
    'Fiction',
    'Sci-Fi',
    'Romance',
    'Fantasy',
    'Adventure',
    'Dystopian',
    'Classic',
  ];
  const prices = ['All Prices', 'Under $10', '$10 - $20', '$20 - $30'];

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    onFilterChange(e.target.value, selectedPrice);
  };

  const handlePriceChange = (e) => {
    setSelectedPrice(e.target.value);
    onFilterChange(selectedGenre, e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <select
        value={selectedGenre}
        onChange={handleGenreChange}
        className="p-3 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
      >
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
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