import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataContext } from '../src/contexts/DataContext';
import { approveBook, deleteBook, getAdminCategories } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const AdminBooksPage = () => {
  const { books: allBooks, refreshData } = React.useContext(DataContext);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;

  // Fetch Category Admin
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getAdminCategories();
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message || 'Failed to load categories');
        toast.error(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Debug data
  useEffect(() => {
    console.log('allBooks:', allBooks);
    console.log('categories:', categories);
    console.log('loading:', loading);
    console.log('error:', error);
  }, [allBooks, categories, loading, error]);

  // Memoize filtered books
  const filteredBooks = useMemo(() => {
    if (!allBooks || !Array.isArray(allBooks)) {
      console.warn('allBooks is not an array or is undefined');
      return [];
    }

    let filtered = [...allBooks];

    filtered = filtered.filter((book) => {
      if (!book) return false;
      const matchesSearch =
        !search ||
        (book.title && book.title.toLowerCase().includes(search.toLowerCase())) ||
        (book.author && book.author.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus =
        statusFilter === 'all' ||
        book.status === statusFilter;
      const price = Number(book.price) || 0;
      const min = minPrice ? Number(minPrice) : -Infinity;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;
      const matchesCategory =
        categoryFilter === 'all' ||
        (book.genre && categories.some(cat => cat.name.toLowerCase() === book.genre.toLowerCase() && cat.id === categoryFilter));

      return matchesSearch && matchesStatus && matchesPrice && matchesCategory;
    });

    filtered.sort((a, b) => {
      const valueA = sortBy === 'price' ? Number(a.price || 0) : (a.title || '').toLowerCase();
      const valueB = sortBy === 'price' ? Number(b.price || 0) : (b.title || '').toLowerCase();
      return sortDirection === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    return filtered;
  }, [allBooks, search, statusFilter, minPrice, maxPrice, sortBy, sortDirection, categoryFilter, categories]);

  // Memoize paginated books
  const paginatedBooks = useMemo(() => {
    console.log('filteredBooks:', filteredBooks);
    const startIndex = (page - 1) * limit;
    return filteredBooks.slice(startIndex, startIndex + limit);
  }, [filteredBooks, page]);

  // Adjust page when filteredBooks change
  useEffect(() => {
    console.log('paginatedBooks:', paginatedBooks);
    const maxPage = Math.ceil(filteredBooks.length / limit);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    } else if (filteredBooks.length === 0) {
      setPage(1);
    }
  }, [filteredBooks, page]);

  const handleDelete = useCallback(async (bookId) => {
    try {
      setLoading(true);
      await deleteBook(bookId);
      refreshData();
      toast.success('Book deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete book');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const handleApprove = useCallback(async (bookId, status) => {
    try {
      setLoading(true);
      await approveBook(bookId, status);
      refreshData();
      if (selectedBook?.id === bookId) {
        setSelectedBook((prev) => prev ? { ...prev, status } : null);
      }
      toast.success(`Book ${status}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update book status');
    } finally {
      setLoading(false);
    }
  }, [selectedBook, refreshData]);

  const handleViewDetails = useCallback((book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBook(null);
  }, []);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setSearch('');
    setStatusFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('title');
    setSortDirection('asc');
    setCategoryFilter('all');
    setError(null);
    refreshData();
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 animate-fade-in">Manage Books</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSyncAlt} />
            Refresh
          </button>
        </div>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading || categories.length === 0}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="p-3 border rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="p-3 border rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          >
            <option value="title">Sort by Title</option>
            <option value="price">Sort by Price</option>
          </select>
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <p className="mb-6 text-gray-600">Total Books: {allBooks?.length || 0} (Filtered: {filteredBooks.length})</p>
        {loading ? (
          <div className="text-center text-gray-600 py-6">Loading...</div>
        ) : !allBooks || allBooks.length === 0 ? (
          <div className="text-center text-gray-600 py-6">
            <p>No books available. Please check the API or add books to the system.</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Refreshing
            </button>
          </div>
        ) : paginatedBooks.length === 0 ? (
          <p className="text-center text-gray-600">
            {search || statusFilter !== 'all' || minPrice || maxPrice || categoryFilter !== 'all'
              ? 'No books match your search criteria.'
              : 'No books found.'}
          </p>
        ) : (
          <>
            <div className="md:hidden">
              {paginatedBooks.map((book) => (
                <div key={book.id} className="border-b p-4">
                  <div className="flex items-center gap-2">
                    {book.bookImage && (
                      <img
                        src={book.bookImage}
                        alt={book.title || 'Book'}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <p>
                      <strong>Title:</strong>{' '}
                      <button
                        onClick={() => handleViewDetails(book)}
                        className="text-blue-600 hover:underline"
                      >
                        {book.title || 'Unknown Title'}
                      </button>
                    </p>
                  </div>
                  <p><strong>Author:</strong> {book.author || 'Unknown Author'}</p>
                  <p><strong>Price:</strong> ${book.price ? Number(book.price).toFixed(2) : '0.00'}</p>
                  <p><strong>Category:</strong> {book.genre || 'Unknown Category'}</p>
                  <p><strong>Status:</strong> {book.status || 'Unknown'}</p>
                  <div className="mt-2 flex gap-2">
                    {book.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(book.id, 'approved')}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprove(book.id, 'rejected')}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-green-600"
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Cover</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Author</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBooks.map((book) => (
                    <tr key={book.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {book.bookImage ? (
                          <img
                            src={book.bookImage}
                            alt={book.title || 'Book'}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => handleViewDetails(book)}
                          className="text-blue-600 hover:underline"
                        >
                          {book.title || 'Unknown Title'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{book.author || 'Unknown Author'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${book.price ? Number(book.price).toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{book.genre || 'Unknown Category'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            book.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : book.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : book.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {book.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {book.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(book.id, 'approved')}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprove(book.id, 'rejected')}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-600">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={paginatedBooks.length < limit || page * limit >= filteredBooks.length || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            {isModalOpen && selectedBook && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                  <h2 className="text-xl font-bold mb-4 text-blue-800">Book Details</h2>
                  {selectedBook.bookImage ? (
                    <img
                      src={selectedBook.bookImage}
                      alt={selectedBook.title || 'Book'}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <p className="text-gray-600 mb-4">No image available</p>
                  )}
                  <p><strong>ID:</strong> {selectedBook.id || 'N/A'}</p>
                  <p><strong>Title:</strong> {selectedBook.title || 'Unknown Title'}</p>
                  <p><strong>Author:</strong> {selectedBook.author || 'Unknown Author'}</p>
                  <p><strong>Price:</strong> ${selectedBook.price ? Number(selectedBook.price).toFixed(2) : '0.00'}</p>
                  <p><strong>Category:</strong> {selectedBook.genre || 'Unknown Category'}</p>
                  <p><strong>Status:</strong> {selectedBook.status || 'Unknown'}</p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      disabled={loading}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBooksPage;