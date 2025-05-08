// src/pages/BrowseBooksPage.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import BookCard from '../Components/BookCard';
import FilterBar from '../Components/FilterBar';
import SearchBar from '../Components/SearchBar';
import { useCart } from '../src/contexts/CartContext';
import { DataContext } from '../src/contexts/DataContext';
import { toast } from 'react-toastify';

const BrowseBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isFiltering, setIsFiltering] = useState(false);
  const { addToCart } = useCart();
  const { setGoogleBooks } = useContext(DataContext);

  const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  const genreMap = {
    Fiction: 'Fiction',
    'Juvenile Fiction': 'Fiction',
    'Literary Criticism': 'Classic',
    'Science Fiction': 'Sci-Fi',
    Romance: 'Romance',
    Dystopian: 'Dystopian',
    Fantasy: 'Fantasy',
    Adventure: 'Adventure',
  };

  const fetchBooks = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = query
        ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query
          )}&maxResults=20&key=${API_KEY}`
        : `https://www.googleapis.com/books/v1/volumes?q=fiction&maxResults=20&key=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();

      const mappedBooks = data.items?.map((item) => {
        const rawGenre = item.volumeInfo.categories?.[0] || 'Unknown Genre';
        const price = item.saleInfo?.listPrice?.amount || (Math.random() * 20 + 5).toFixed(2);
        return {
          bookId: item.id,
          title: item.volumeInfo.title || 'Unknown Title',
          author: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
          genre: genreMap[rawGenre] || 'Unknown Genre',
          price,
          image: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150',
          description: item.volumeInfo.description || 'No description available',
          publishedDate: item.volumeInfo.publishedDate || 'Unknown Date',
        };
      }) || [];

      setBooks(mappedBooks);
      setGoogleBooks(mappedBooks);
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
      const genreMatch =
        selectedGenre === 'All Genres' ||
        book.genre.toLowerCase() === selectedGenre.toLowerCase();

      const priceMatch =
        selectedPrice === 'All Prices' ||
        (selectedPrice === 'Under $10' && parseFloat(book.price) < 10) ||
        (selectedPrice === '$10 - $20' &&
          parseFloat(book.price) >= 10 &&
          parseFloat(book.price) <= 20) ||
        (selectedPrice === '$20 - $30' &&
          parseFloat(book.price) > 20 &&
          parseFloat(book.price) <= 30);

      const searchMatch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return genreMatch && priceMatch && searchMatch;
    });
  };

  // Kiểm tra trạng thái lọc/tìm kiếm hoặc chế độ xem
  useEffect(() => {
    if (
      searchQuery !== '' ||
      selectedGenre !== 'All Genres' ||
      selectedPrice !== 'All Prices' ||
      viewMode === 'list' // Ẩn khi ở chế độ list
    ) {
      setIsFiltering(true);
    } else {
      setIsFiltering(false);
    }

    if (!loading) {
      setFilteredBooks(filterBooks());
    }
  }, [searchQuery, selectedGenre, selectedPrice, books, loading, viewMode]);

  // Lọc sách nổi bật (giả lập: sách có giá cao nhất)
  const featuredBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 5);
  }, [books]);

  // Lọc sách mới (giả lập: sách có ngày xuất bản gần nhất hoặc ID lớn nhất)
  const newBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => {
        const dateA = new Date(a.publishedDate);
        const dateB = new Date(b.publishedDate);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [books]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchBooks(query);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-800 text-center">
          Discover Your Next Favorite Book
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
          <FilterBar onFilterChange={handleFilterChange} />
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

        {/* Hiển thị Featured Books và New Releases chỉ khi không có tìm kiếm/lọc và ở chế độ grid */}
        {!isFiltering && (
          <>
            {featuredBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-blue-700">Featured Books</h2>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {featuredBooks.map((book) => (
                    <div
                      key={book.bookId}
                      className="flex-none w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-t-lg"
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
                          <a
                            href={`/book-details/${book.bookId}`}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center text-sm"
                          >
                            View Details
                          </a>
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
                      key={book.bookId}
                      className="flex-none w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-t-lg"
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
                          <a
                            href={`/book-details/${book.bookId}`}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center text-sm"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Phần All Books luôn hiển thị */}
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
            <div
              key={book.bookId}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${
                viewMode === 'list' ? 'flex items-center gap-4 p-4' : ''
              }`}
            >
              <img
                src={book.image}
                alt={book.title}
                className={`rounded-lg object-cover ${
                  viewMode === 'grid'
                    ? 'w-full h-48 rounded-t-lg'
                    : 'w-24 h-32 rounded-lg'
                }`}
              />
              <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
                <h3 className="text-lg font-semibold text-blue-800 truncate">{book.title}</h3>
                <p className="text-sm text-gray-600 truncate">{book.author}</p>
                <p className="text-blue-600 font-bold mt-2">${parseFloat(book.price).toFixed(2)}</p>
                <div className={`mt-4 flex gap-2 ${viewMode === 'list' ? 'flex-row' : ''}`}>
                  <button
                    onClick={() => handleAddToCart(book)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add to Cart
                  </button>
                  <a
                    href={`/book-details/${book.bookId}`}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center text-sm"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseBooksPage;