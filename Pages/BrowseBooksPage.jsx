// src/pages/BrowseBooksPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../Components/SearchBar";
import FilterBar from "../Components/FilterBar";
import { useCart } from "../src/contexts/CartContext";  // Import CartContext

const BrowseBooksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  const { addToCart } = useCart();  // Lấy hàm addToCart từ CartContext

  const books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", price: 15, image: "/img/gatsby.jpg" },
    { id: 2, title: "1984", author: "George Orwell", genre: "Dystopian", price: 18, image: "/img/1984.jpg" },
    { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", price: 25, image: "/img/mockingbird.jpg" },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", price: 22, image: "/img/pride.jpg" },
    { id: 5, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", price: 30, image: "/img/hobbit.jpg" },
    { id: 6, title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", price: 17, image: "/img/catcher.jpg" },
    { id: 7, title: "Brave New World", author: "Aldous Huxley", genre: "Sci-Fi", price: 20, image: "/img/brave.jpg" },
    { id: 8, title: "Moby Dick", author: "Herman Melville", genre: "Adventure", price: 28, image: "/img/moby.jpg" },
  ];

  const filterBooks = () => {
    return books.filter((book) => {
      const genreMatch = selectedGenre === "All Genres" || book.genre === selectedGenre;
      const priceMatch =
        selectedPrice === "All Prices" ||
        (selectedPrice === "Under $10" && book.price < 10) ||
        (selectedPrice === "$10 - $20" && book.price >= 10 && book.price <= 20) ||
        (selectedPrice === "$20 - $30" && book.price > 20 && book.price <= 30);

      const searchMatch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return genreMatch && priceMatch && searchMatch;
    });
  };

  useEffect(() => {
    setFilteredBooks(filterBooks());
  }, [searchQuery, selectedGenre, selectedPrice]);

  const handleSearch = (query) => setSearchQuery(query);
  const handleFilterChange = (genre, price) => {
    setSelectedGenre(genre);
    setSelectedPrice(price);
  };

  const handleAddToCart = (book) => {
    addToCart(book);  // Thêm sách vào giỏ
    alert(`Added "${book.title}" to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
        <FilterBar onFilterChange={handleFilterChange} />

        {/* Toggle View Mode */}
        <div className="space-x-2">
          <button
            className={`px-3 py-1 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setViewMode("grid")}
          >
            Grid View
          </button>
          <button
            className={`px-3 py-1 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setViewMode("list")}
          >
            List View
          </button>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : "flex flex-col gap-6"
          }`}
        >
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              <img
                src={book.image}
                alt={book.title}
                className={`${viewMode === "list" ? "w-40 h-auto object-cover" : "w-full h-48 object-cover"}`}
              />
              <div className="p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                  <div className="mt-1 text-blue-600 font-bold text-md">${book.price}</div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/book-details/${book.id}`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(book)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 col-span-full">No books found.</p>
      )}
    </div>
  );
};

export default BrowseBooksPage;
