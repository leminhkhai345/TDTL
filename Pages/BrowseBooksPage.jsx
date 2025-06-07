import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../Components/BookCard';
import { useCart } from '../src/contexts/CartContext';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getListedDocuments, getCategories, getSellerAverageRating } from '../src/API/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faList, faDollarSign, faTh, faListUl, faChevronDown } from '@fortawesome/free-solid-svg-icons';

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
  const { isLoggedIn } = useAuth();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const navigate = useNavigate();
  const [sellerRatings, setSellerRatings] = useState({});

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

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const mappedBooks = await getListedDocuments(1, 50);
      console.log('Books data:', mappedBooks);
      setBooks(mappedBooks);
      setFilteredBooks(mappedBooks);

      // Lấy điểm trung bình cho từng người bán
      const ratings = {};
      for (const book of mappedBooks) {
        if (book.ownerId && !ratings[book.ownerId]) {
          try {
            const avgRating = await getSellerAverageRating(book.ownerId);
            ratings[book.ownerId] = avgRating || 0;
          } catch (err) {
            ratings[book.ownerId] = 0;
          }
        }
      }
      setSellerRatings(ratings);
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
        book.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
      const priceMatch =
        selectedPrice === 'All Prices' ||
        (selectedPrice === '1-2' && parseFloat(book.price || 0) >= 1 && parseFloat(book.price || 0) <= 2) ||
        (selectedPrice === '2-4' && parseFloat(book.price || 0) > 2 && parseFloat(book.price || 0) <= 4) ||
        (selectedPrice === 'Above 4' && parseFloat(book.price || 0) > 4);
      const searchMatch =
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
  };

  const handlePriceSelect = (price) => {
    setSelectedPrice(price);
    setIsPriceOpen(false);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleAddToCart = (book) => {
    addToCart(book);
    toast.success(`${book.title} has been added to cart!`);
  };

  const handleBuyNow = (book) => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    if (book.statusName !== 'Active') {
      toast.error('Sách này không thể mua vì chưa được phê duyệt.');
      return;
    }
    navigate('/order', { state: { listing: book } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
        <h1 className="text-4xl font-sans font-bold mb-8 text-blue-800 text-center">
          Discover Your Favorite Books
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search books..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-sans text-sm shadow-sm hover:shadow-md transition-all duration-200"
              aria-label="Search books"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-sans text-sm font-medium shadow-sm hover:scale-105 transition-all duration-200"
                aria-expanded={isCategoryOpen}
                aria-label="Select category"
              >
                <FontAwesomeIcon icon={faList} className="text-sm" />
                <span>{selectedCategory}</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-sm transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryOpen && (
                <div className="absolute top-12 left-0 w-48 bg-white rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto border border-gray-100 animate-dropdown">
                  <button
                    onClick={() => handleCategorySelect('All Categories')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 font-sans text-sm transition-colors"
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 font-sans text-sm transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsPriceOpen(!isPriceOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 font-sans text-sm font-medium shadow-sm hover:scale-105 transition-all duration-200"
                aria-expanded={isPriceOpen}
                aria-label="Select price range"
              >
                <FontAwesomeIcon icon={faDollarSign} className="text-sm" />
                <span>{selectedPrice}</span>
                <FontAwesomeIcon icon={faChevronDown} className={`text-sm transition-transform ${isPriceOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPriceOpen && (
                <div className="absolute top-12 left-0 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-100 animate-dropdown">
                  <button
                    onClick={() => handlePriceSelect('All Prices')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 font-sans text-sm transition-colors"
                  >
                    All Prices
                  </button>
                  <button
                    onClick={() => handlePriceSelect('1-2')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 font-sans text-sm transition-colors"
                  >
                    $1 - $2
                  </button>
                  <button
                    onClick={() => handlePriceSelect('2-4')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 font-sans text-sm transition-colors"
                  >
                    $2 - $4
                  </button>
                  <button
                    onClick={() => handlePriceSelect('Above 4')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 font-sans text-sm transition-colors"
                  >
                    Above $4
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-full transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } hover:scale-105`}
                aria-label="Switch to grid view"
              >
                <FontAwesomeIcon icon={faTh} className="text-sm" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-full transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } hover:scale-105`}
                aria-label="Switch to list view"
              >
                <FontAwesomeIcon icon={faListUl} className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {!isFiltering && (
          <>
            {featuredBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-sans font-semibold mb-4 text-blue-700">Featured Books</h2>
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
                        <h3 className="text-lg font-sans font-semibold text-blue-800 truncate">{book.title}</h3>
                        <p className="text-sm font-sans text-gray-600 truncate">{book.author}</p>
                        <p className="text-blue-600 font-sans font-bold mt-2 text-sm">${parseFloat(book.price).toFixed(2)}</p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleBuyNow(book)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-sans text-sm text-center hover:scale-105"
                          >
                            Buy Now
                          </button>
                          <Link
                            to={`/books/${book.listingId}`}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-sans text-sm text-center hover:scale-105"
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
                <h2 className="text-2xl font-sans font-semibold mb-4 text-blue-700">New Releases</h2>
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
                        <h3 className="text-lg font-sans font-semibold text-blue-800 truncate">{book.title}</h3>
                        <p className="text-sm font-sans text-gray-600 truncate">{book.author}</p>
                        <p className="text-blue-600 font-sans font-bold mt-2 text-sm">${parseFloat(book.price).toFixed(2)}</p>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleBuyNow(book)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-sans text-sm text-center hover:scale-105"
                          >
                            Buy Now
                          </button>
                          <Link
                            to={`/books/${book.listingId}`}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-sans text-sm text-center hover:scale-105"
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

        <h2 className="text-2xl font-sans font-semibold mb-4 text-blue-700">All Books</h2>
        {loading && <div className="text-center py-6 text-gray-600 font-sans text-sm">Loading...</div>}
        {error && <div className="text-center text-red-600 py-6 font-sans text-sm">{error}</div>}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="text-center py-6 text-gray-600 font-sans text-sm">No books found.</div>
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
                averageRating: sellerRatings[book.ownerId] || 0
              }}
              viewMode={viewMode}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes dropdown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-dropdown {
          animation: dropdown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BrowseBooksPage;