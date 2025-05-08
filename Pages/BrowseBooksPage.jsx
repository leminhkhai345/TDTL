// src/pages/BrowseBooksPage.jsx
import React, { useState, useEffect } from "react";
import BookCard from "../Components/BookCard";
import FilterBar from "../Components/FilterBar";
import SearchBar from "../Components/SearchBar";
import { useCart } from "../src/contexts/CartContext";
import { toast } from "react-toastify";

const BrowseBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const { addToCart } = useCart();

  const API_KEY = "AIzaSyD-HCLvX01x57PU6rKtLJSFjiCKsf-Ldfk"; // Nên lưu trong .env

  // Ánh xạ thể loại từ Google Books sang danh sách trong FilterBar
  const genreMap = {
    "Fiction": "Fiction",
    "Juvenile Fiction": "Fiction",
    "Literary Criticism": "Classic",
    "Science Fiction": "Sci-Fi",
    "Romance": "Romance",
    "Dystopian": "Dystopian",
    "Fantasy": "Fantasy",
    "Adventure": "Adventure",
    // Thêm ánh xạ nếu cần
  };

  const fetchBooks = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = query
        ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${API_KEY}`
        : `https://www.googleapis.com/books/v1/volumes?q=fiction&maxResults=20&key=${API_KEY}`;
      const response = await fetch(url);
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();

      // Ánh xạ dữ liệu từ Google Books API
      const mappedBooks = data.items?.map((item) => {
        const rawGenre = item.volumeInfo.categories?.[0] || "Unknown Genre";
        return {
          bookId: item.id,
          title: item.volumeInfo.title || "Unknown Title",
          author: item.volumeInfo.authors?.join(", ") || "Unknown Author",
          genre: genreMap[rawGenre] || "Unknown Genre", // Ánh xạ thể loại
          price: item.saleInfo?.listPrice?.amount || (Math.random() * 20 + 5).toFixed(2),
          image: item.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150",
          description: item.volumeInfo.description || "No description available",
        };
      }) || [];

      setBooks(mappedBooks);
      setFilteredBooks(mappedBooks);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filterBooks = () => {
    return books.filter((book) => {
      // Lọc thể loại
      const genreMatch =
        selectedGenre === "All Genres" ||
        book.genre.toLowerCase() === selectedGenre.toLowerCase();

      // Lọc giá
      const priceMatch =
        selectedPrice === "All Prices" ||
        (selectedPrice === "Under $10" && parseFloat(book.price) < 10) ||
        (selectedPrice === "$10 - $20" &&
          parseFloat(book.price) >= 10 &&
          parseFloat(book.price) <= 20) ||
        (selectedPrice === "$20 - $30" &&
          parseFloat(book.price) > 20 &&
          parseFloat(book.price) <= 30);

      // Lọc tìm kiếm
      const searchMatch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return genreMatch && priceMatch && searchMatch;
    });
  };

  useEffect(() => {
    if (!loading) {
      setFilteredBooks(filterBooks());
    }
  }, [searchQuery, selectedGenre, selectedPrice, books, loading]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (genre, price) => {
    setSelectedGenre(genre);
    setSelectedPrice(price);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAddToCart = (book) => {
    addToCart(book);
    toast.success(`${book.title} added to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Browse Books</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
        <FilterBar onFilterChange={handleFilterChange} />
        <div className="flex gap-2">
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`px-4 py-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Grid
          </button>
          <button
            onClick={() => handleViewModeChange("list")}
            className={`px-4 py-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            List
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-6">Loading...</div>}
      {error && <div className="text-center text-red-600 py-6">{error}</div>}
      {!loading && !error && filteredBooks.length === 0 && (
        <div className="text-center py-6">No books found.</div>
      )}

      <div
        className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"}`}
      >
        {filteredBooks.map((book) => (
          <BookCard
            key={book.bookId}
            book={book}
            viewMode={viewMode}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowseBooksPage;