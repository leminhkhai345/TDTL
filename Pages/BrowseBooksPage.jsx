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
  const [viewMode, setViewMode] = useState('grid');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
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
    fetchBooks(); // Gọi API lấy danh sách sách không cần check login
  }, []);

  useEffect(() => {
    setFilteredBooks(filterBooks());
    // eslint-disable-next-line
  }, [searchQuery, selectedCategory, selectedPrice, books, viewMode]);

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
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && priceMatch && searchMatch;
    });
  };

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
      toast.info('Please log in to purchase');
      navigate('/login', { 
        state: { from: `/books/${book.listingId}` }
      });
      return;
    }
    navigate('/order', { state: { listing: book } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-4xl font-bold mb-8 text-blue-800 text-center tracking-tight">Browse Books</h1>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gradient-to-r from-blue-100 via-white to-blue-100 rounded-xl shadow mb-8 border border-blue-200">
          {/* Search */}
          <div className="relative flex-1 min-w-[320px] max-w-2xl">
            <input
           Payment Methods   type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by title or author..."
              className="w-full bg-gray-100 rounded-lg pl-4 pr-10 py-2 focus:outline-none text-gray-800 border border-gray-200 shadow-sm"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
            />
          </div>
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 text-blue-700 font-semibold transition min-w-[160px]"
            >
              <FontAwesomeIcon icon={faList} />
              <span className="truncate max-w-[90px]">{selectedCategory}</span>
              <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoryOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 animate-dropdown">
                <button
                  onClick={() => handleCategorySelect('All Categories')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 text-sm transition-colors"
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 text-sm transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Price Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPriceOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 text-blue-700 font-semibold transition min-w-[130px]"
            >
              <FontAwesomeIcon icon={faDollarSign} />
              <span>{selectedPrice}</span>
              <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${isPriceOpen ? 'rotate-180' : ''}`} />
            </button>
            {isPriceOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 animate-dropdown">
                <button
                  onClick={() => handlePriceSelect('All Prices')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 text-sm transition-colors"
                >
                  All Prices
                </button>
                <button
                  onClick={() => handlePriceSelect('1-2')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 text-sm transition-colors"
                >
                  $1 - $2
                </button>
                <button
                  onClick={() => handlePriceSelect('2-4')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 text-sm transition-colors"
                >
                  $2 - $4
                </button>
                <button
                  onClick={() => handlePriceSelect('Above 4')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-800 text-sm transition-colors"
                >
                  Above $4
                </button>
              </div>
            )}
          </div>
          {/* View Mode */}
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

        {/* Book List */}
        {loading ? (
          <div className="text-center py-16 text-blue-700 text-lg font-semibold">Loading books...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-600 text-lg font-semibold">{error}</div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-lg">No books found.</div>
        ) : (
          <div
            className={`gap-6 ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'flex flex-col'
            }`}
          >
            {filteredBooks.map((book) => (
              <BookCard
                key={book.listingId}
                book={{
                  ...book,
                  bookId: book.listingId,
                  genre: book.categoryName,
                  image: book.imageUrl, // Thêm dòng này để BookCard nhận đúng hình ảnh
                }}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                requiresAuth={true} // Truyền prop này để kiểm soát việc yêu cầu đăng nhập
              />
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .animate-dropdown {
          animation: dropdown 0.2s ease-out;
        }
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
      `}</style>
    </div>
  );
};

export default BrowseBooksPage;