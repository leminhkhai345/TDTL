// File: BrowseBooksPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../Components/BookCard';
import FilterBar from '../Components/FilterBar';
import SearchBar from '../Components/SearchBar';
import { useCart } from '../src/contexts/CartContext';
import { toast } from 'react-toastify';
import { getListedDocuments, getCategories } from '../src/API/api';

const BrowseBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isFiltering, setIsFiltering] = useState(false);
  const { addToCart } = useCart();

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.map(cat => cat.categoryName));
      } catch (err) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch books from api.js
  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const mappedBooks = await getListedDocuments(1, 50); // Fetch up to 50 books
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
      const categoryMatch =
        selectedCategory === 'All Categories' ||
        book.categoryName.toLowerCase() === selectedCategory.toLowerCase();

      const priceMatch =
        selectedPrice === 'All Prices' ||
        (selectedPrice === '1-2' && parseFloat(book.price) >= 1 && parseFloat(book.price) <= 2) ||
        (selectedPrice === '2-4' && parseFloat(book.price) > 2 && parseFloat(book.price) <= 4) ||
        (selectedPrice === 'Above 4' && parseFloat(book.price) > 4);

      const searchMatch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && priceMatch && searchMatch;
    });
  };

  useEffect(() => {
    if (
      searchQuery !== '' ||
      selectedCategory !== 'All Categories' ||
      selectedPrice !== 'All Prices' ||
      viewMode === 'list'
    ) {
      setIsFiltering(true);
    } else {
      setIsFiltering(false);
    }

    if (!loading) {
      setFilteredBooks(filterBooks());
    }
  }, [searchQuery, selectedCategory, selectedPrice, books, loading, viewMode]);

  const featuredBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 5);
  }, [books]);

  const newBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [books]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (category, price) => {
    setSelectedCategory(category);
    setSelectedPrice(price);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAddToCart = (book) => {
    addToCart(book);
    toast.success(`${book.title} has been added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-800 text-center">
          Discover Your Favorite Books
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
          <FilterBar
            categories={categories}
            onFilterChange={handleFilterChange}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {!isFiltering && (
          <>
            {featuredBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-blue-700">Featured Books</h2>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {featuredBooks.map((book) => (
                    <div
                      key={book.listingId}
                      className="flex-none w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-blue-800 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{book.author}</p>
                        <p className="text-blue-600 font-bold mt-2">${parseFloat(book.price).toFixed(2)}</p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleAddToCart(book)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Add to Cart
                          </button>
                          <Link
                            to={`/books/${book.listingId}`}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-blue-700">New Releases</h2>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {newBooks.map((book) => (
                    <div
                      key={book.listingId}
                      className="flex-none w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-blue-800 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{book.author}</p>
                        <p className="text-blue-600 font-bold mt-2">${parseFloat(book.price).toFixed(2)}</p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleAddToCart(book)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Add to Cart
                          </button>
                          <Link
                            to={`/books/${book.listingId}`}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <h2 className="text-2xl font-semibold mb-4 text-blue-700">All Books</h2>
        {loading && <div className="text-center py-6">Loading...</div>}
        {error && <div className="text-center text-red-600 py-6">{error}</div>}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="text-center py-6">No books found.</div>
        )}

        <div
          className={`gap-6 ${
            viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'flex flex-col'
          }`}
        >
          {filteredBooks.map((book) => (
            <BookCard
              key={book.listingId}
              book={{
                ...book,
                bookId: book.listingId,
                genre: book.categoryName,
              }}
              viewMode={viewMode}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseBooksPage;