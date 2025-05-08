// src/pages/AdminBooksPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { DataContext } from '../src/contexts/DataContext';
import { approveBook, deleteBook } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const AdminBooksPage = () => {
  const { books: allBooks, refreshData } = useContext(DataContext);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  // Memoize dữ liệu đã lọc
  const filteredBooks = useMemo(() => {
    let filtered = [...allBooks];

    filtered = filtered.filter((book) => {
      const matchesSearch =
        !search ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && book.status === 'pending') ||
        (statusFilter === 'approved' && book.status === 'approved') ||
        (statusFilter === 'rejected' && book.status === 'rejected');
      const price = Number(book.price);
      const min = minPrice ? Number(minPrice) : -Infinity;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesStatus && matchesPrice;
    });

    filtered.sort((a, b) => {
      const valueA = sortBy === 'price' ? Number(a.price) : a.title.toLowerCase();
      const valueB = sortBy === 'price' ? Number(b.price) : b.title.toLowerCase();
      return sortDirection === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    return filtered;
  }, [allBooks, search, statusFilter, minPrice, maxPrice, sortBy, sortDirection]);

  // Memoize dữ liệu phân trang
  const paginatedBooks = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return filteredBooks.slice(startIndex, endIndex);
  }, [filteredBooks, page]);

  // Cập nhật tổng số và điều chỉnh page khi cần
  useEffect(() => {
    const maxPage = Math.ceil(filteredBooks.length / limit);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    } else if (filteredBooks.length === 0) {
      setPage(1);
    }
  }, [filteredBooks, page]);

  const handleDelete = useCallback(async (bookId) => {
    try {
      await deleteBook(bookId);
      refreshData();
      toast.success('Book deleted successfully');
    } catch (err) {
      toast.error(err.message);
    }
  }, [refreshData]);

  const handleApprove = useCallback(async (bookId, status) => {
    try {
      await approveBook(bookId, status);
      refreshData();
      if (selectedBook?.id === bookId) {
        setSelectedBook((prev) => ({ ...prev, status }));
      }
      toast.success(`Book ${status}`);
    } catch (err) {
      toast.error(err.message);
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
    refreshData();
  }, [refreshData]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Manage Books</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          Refresh
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="p-2 border rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-2 border rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="title">Sort by Title</option>
          <option value="price">Sort by Price</option>
        </select>
        <select
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <p className="mb-6 text-gray-600">Total Books: {allBooks.length} (Filtered: {filteredBooks.length})</p>
      {paginatedBooks.length === 0 ? (
        <p className="text-center text-gray-600">
          {search || statusFilter !== 'all' || minPrice || maxPrice
            ? 'No books match your search.'
            : 'No books found.'}
        </p>
      ) : (
        <div>
          <div className="md:hidden">
            {paginatedBooks.map((book) => (
              <div key={book.id} className="border-b p-4">
                <div className="flex items-center gap-2">
                  {book.coverImage && (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <p>
                    <strong>Title:</strong>{' '}
                    <button
                      onClick={() => handleViewDetails(book)}
                      className="text-blue-600 hover:underline"
                    >
                      {book.title}
                    </button>
                  </p>
                </div>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Price:</strong> ${book.price?.toFixed(2)}</p>
                <p><strong>Status:</strong> {book.status}</p>
                <div className="mt-2 flex gap-2">
                  {book.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(book.id, 'approved')}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprove(book.id, 'rejected')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBooks.map((book) => (
                  <tr key={book.id} className="border-b">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {book.coverImage && (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => handleViewDetails(book)}
                        className="text-blue-600 hover:underline"
                      >
                        {book.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{book.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${book.price?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          book.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : book.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {book.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(book.id, 'approved')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprove(book.id, 'rejected')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={paginatedBooks.length < limit || page * limit >= filteredBooks.length}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Book Details</h2>
            {selectedBook.coverImage && (
              <img
                src={selectedBook.coverImage}
                alt={selectedBook.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <p><strong>ID:</strong> {selectedBook.id}</p>
            <p><strong>Title:</strong> {selectedBook.title}</p>
            <p><strong>Author:</strong> {selectedBook.author}</p>
            <p><strong>Price:</strong> ${selectedBook.price?.toFixed(2)}</p>
            <p><strong>Status:</strong> {selectedBook.status}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooksPage;