import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../src/contexts/CartContext';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getListingById, createOrder } from '../src/API/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const BookDetailsPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const  [hasOrdered, setHasOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethodDescriptions = {
    1: 'COD - Cash on Delivery',
    2: 'Bank Transfer',
  };

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!listingId || listingId === 'undefined' || isNaN(parseInt(listingId))) {
        throw new Error('Invalid listing ID. Please check the link or try another book.');
      }
      const listingData = await getListingById(listingId);
      if (!listingData) {
        throw new Error('Book does not exist or has not been approved for display.');
      }
      setListing(listingData);
      if (listingData.acceptedPaymentMethods && listingData.acceptedPaymentMethods.length === 1) {
        setPaymentMethodId(listingData.acceptedPaymentMethods[0].paymentMethodId || listingData.acceptedPaymentMethods[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load book details');
      toast.error(err.message || 'Failed to load book details');
      if (err.message.includes('Unauthorized')) {
        toast.info('Please log in to continue');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingDetails();
  }, [listingId, navigate]);

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.info('Please log in to make a purchase');
      navigate('/login');
      return;
    }
    if (listing.statusName !== 'Active') {
      toast.error('This book cannot be purchased as it has not been approved.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsConfirmModalOpen(false);
    setShippingAddress('');
    setPaymentMethodId(listing?.acceptedPaymentMethods?.length === 1 ? listing.acceptedPaymentMethods[0].paymentMethodId : null);
  };

  const handleProceedToConfirm = () => {
    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address');
      return;
    }
    if (shippingAddress.length > 500) {
      toast.error('Shipping address cannot exceed 500 characters');
      return;
    }
    if (!paymentMethodId) {
      toast.error('Please select a payment method');
      return;
    }
    setIsModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleModalSubmit = async () => {
    setIsSubmitting(true);
    const orderData = {
      listingId: listing.listingId,
      shippingAddress,
      paymentMethodId,
      notes: '',
    };

    try {
      const response = await createOrder(orderData);
      toast.success(`Order #${response.orderId} created successfully!`);
      setIsConfirmModalOpen(false);
      setHasOrdered(true);
      if (response.paymentMethodName === 'BankTransfer') {
        navigate(`/orders/${response.orderId}/confirm-payment`, { state: { rowVersion: response.rowVersion } });
      } else {
        navigate(`/orders/${response.orderId}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create order');
      if (error.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (listing) {
      const mappedListing = {
        listingId: listing.listingId,
        documentId: listing.documentId,
        title: listing.title || 'Unknown Title',
        author: listing.author || 'Unknown Author',
        categoryName: listing.categoryName || 'Unknown Category',
        price: listing.price !== null ? listing.price : null,
        image: listing.imageUrl || 'https://via.placeholder.com/150',
        description: listing.description || 'No description available',
      };
      addToCart(mappedListing);
      toast.success(`${mappedListing.title} has been added to cart!`);
    }
  };

  if (loading) return <div className="text-center py-6">Loading...</div>;

  if (error || !listing) {
    return (
      <div className="text-center text-red-600 py-6">
        {error || 'Book not found'}
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6 mb-8">
        <div className="w-1/3">
          <img
            src={listing.imageUrl || 'https://via.placeholder.com/150'}
            alt={listing.title}
            className="w-full h-72 object-cover rounded-lg"
          />
        </div>
        <div className="w-2/3">
          <h2 className="text-3xl font-semibold text-blue-800">{listing.title}</h2>
          <p className="text-xl text-gray-600">Author: {listing.author || 'Unknown Author'}</p>
          <p className="text-sm text-gray-600 mt-2">Category: {listing.categoryName}</p>
          <p className="text-sm text-gray-600 mt-2">Seller: {listing.ownerName}</p>
          <p className="text-sm text-gray-600 mt-2">
            Type: {listing.listingType === 0 ? 'Sell' : 'Exchange'}
          </p>
          {listing.listingType === 1 && listing.desiredDocumentIds && listing.desiredDocumentIds.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Desired Exchange Book IDs: {listing.desiredDocumentIds.join(', ')}
            </p>
          )}
          {listing.acceptedPaymentMethods && listing.acceptedPaymentMethods.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Payment Methods: {listing.acceptedPaymentMethods.map(method => method.name || method).join(', ')}
            </p>
          )}
          <p className="mt-4 text-lg">{listing.description || 'No description available'}</p>
          <p className="mt-4 text-xl font-bold text-blue-600">
            {listing.price !== null ? `$${parseFloat(listing.price).toFixed(2)}` : 'Price not available'}
          </p>
          <p className="text-sm text-gray-600 mt-2">Status: {listing.statusName}</p>
          {listing.statusName !== 'Active' && (
            <p className="text-sm text-red-600 mt-2">
              This book cannot be purchased or added to cart as it has not been approved.
            </p>
          )}
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={listing.statusName !== 'Active'}
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={listing.statusName !== 'Active' || hasOrdered}
            >
              {hasOrdered ? 'Ordered' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={handleModalClose}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Close modal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="modal-title" className="text-xl font-bold mb-4 text-blue-700">Shipping Information</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Book:</strong> {listing.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Price:</strong> ${parseFloat(listing.price).toFixed(2)}
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-600">
                Shipping Address
              </label>
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter shipping address..."
                maxLength={500}
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-1">{shippingAddress.length}/500 characters</p>
            </div>
            {listing.acceptedPaymentMethods && listing.acceptedPaymentMethods.length > 0 && (
              <div className="mb-4">
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-600">
                  Payment Method
                </label>
                {listing.acceptedPaymentMethods.length === 1 ? (
                  <input
                    id="paymentMethod"
                    type="text"
                    value={paymentMethodDescriptions[listing.acceptedPaymentMethods[0].paymentMethodId] || listing.acceptedPaymentMethods[0].name}
                    className="w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                    aria-readonly="true"
                  />
                ) : (
                  <select
                    id="paymentMethod"
                    value={paymentMethodId || ''}
                    onChange={(e) => setPaymentMethodId(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-required="true"
                  >
                    <option value="" disabled>
                      Select method
                    </option>
                    {listing.acceptedPaymentMethods.map((method) => (
                      <option key={method.paymentMethodId || method} value={method.paymentMethodId || method}>
                        {paymentMethodDescriptions[method.paymentMethodId] || method.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isSubmitting}
                aria-label="Proceed"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="confirm-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={handleModalClose}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Close confirmation modal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="confirm-modal-title" className="text-xl font-bold mb-4 text-blue-700">Confirm Order</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Book:</strong> {listing.title}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Price:</strong> ${parseFloat(listing.price).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Shipping Address:</strong> {shippingAddress}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Payment Method:</strong>{' '}
              {paymentMethodDescriptions[paymentMethodId] ||
                listing.acceptedPaymentMethods.find((m) => m.paymentMethodId === paymentMethodId)?.name}
            </p>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to create this order?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isSubmitting}
                aria-label="Confirm order"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailsPage;