const MOCK_API_URL = import.meta.env.VITE_MOCK_API_URL;
const EXCHANGE_API_URL = import.meta.env.VITE_EXCHANGE_API_URL;
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

// Hàm xử lý phản hồi và lỗi
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi HTTP ${response.status}`);
  }
  return response.json();
};
// Kiểm tra quyền Admin
const checkAdminAccess = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
};


// API quản lý đánh giá (Admin)
export const getReviews = async () => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/reviews`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    const data = await handleResponse(response);
    return {
      reviews: data.reviews || data,
      total: data.total || (Array.isArray(data) ? data.length : 0),
    };
  } catch (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }
};

export const deleteReview = async (reviewId) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }
};
// API quản lý giao dịch (Admin)
export const getOrders = async () => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/orders`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    const data = await handleResponse(response);
    return {
      orders: data.orders || data,
      total: data.total || (Array.isArray(data) ? data.length : 0),
    };
  } catch (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }
};

export const getOrderById = async (orderId) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(`Failed to fetch order details: ${error.message}`);
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

export const deleteOrder = async (orderId) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(`Failed to delete order: ${error.message}`);
  }
};

// API quản lý sách (Admin)
export const getBooks = async () => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/books`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    const data = await handleResponse(response);
    return {
      books: data.books || data,
      total: data.total || (Array.isArray(data) ? data.length : 0),
    };
  } catch (error) {
    throw new Error(`Failed to fetch books: ${error.message}`);
  }
};

export const getBookById = async (bookId) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/books/${bookId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(`Failed to fetch book details: ${error.message}`);
  }
};

export const deleteBook = async (bookId) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(`Failed to delete book: ${error.message}`);
  }
};

export const approveBook = async (bookId, status) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/books/${bookId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(`Failed to approve/reject book: ${error.message}`);
  }
};

//API quản lý user cho admin
export const getUsers = async (page = 1, limit = 10, search = '') => {
  const query = `?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
  const response = await fetch(`${API_URL}/admin/users${query}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });
  const data = await handleResponse(response);
  // Chuẩn hóa dữ liệu cho cả API local và mock API
  return {
    users: data.users || data, // API local trả về { users, total }, mock API trả về mảng
    total: data.total || data.length, // Mock API không có total, dùng length
  };
};

export const getUserById = async (userId) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(`Failed to fetch user details: ${error.message}`);
  }
};

export const lockUser = async (userId, isLocked) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/lock`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify({ isLocked }),
  });
  return handleResponse(response);
};


// Auth APIs
export const loginUser = async (email, password) => {
  const response = await fetch(`${MOCK_API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const data = await handleResponse(response);
  if (data.length === 0) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }
  return data[0];
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${EXCHANGE_API_URL}/api/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: userData.email,
        Phone: userData.phone,
        FullName: userData.fullName,
        Password: userData.password,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to register user";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.errors?.["$"]?.[0] || errorData.message || errorMessage;
      } else {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      return { message: text }; // Chuẩn hóa response text
    }
  } catch (error) {
    throw new Error(error.message || "Failed to register user");
  }
};

export const sendOtp = async (email) => {
  const response = await fetch(`${EXCHANGE_API_URL}/api/user/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};
// Book APIs (Open Library - đã chuyển từ Google Books)
export const getBookDetails = async (bookId) => {
  const response = await fetch(`https://openlibrary.org/works/${bookId}.json`);
  const data = await handleResponse(response);
  return {
    id: bookId,
    volumeInfo: {
      title: data.title,
      authors: data.authors?.map((author) => author.name) || ["Unknown Author"],
      categories: data.subjects || [],
      imageLinks: data.covers
        ? { thumbnail: `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg` }
        : undefined,
    },
    saleInfo: {
      listPrice: { amount: 0 },
    },
  };
};

export const searchBooks = async (searchQuery) => {
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`
  );
  const data = await handleResponse(response);
  return {
    items: data.docs.map((doc) => ({
      id: doc.key.split("/").pop(),
      volumeInfo: {
        title: doc.title,
        authors: doc.author_name || ["Unknown Author"],
        categories: doc.subject || [],
        imageLinks: doc.cover_i
          ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` }
          : undefined,
      },
      saleInfo: {
        listPrice: { amount: doc.price || 0 },
      },
    })),
  };
};

// User APIs
export const getUserProfile = async (userId) => {
  const response = await fetch(`${MOCK_API_URL}/users/${userId}`);
  return handleResponse(response);
};

export const updateUserProfile = async (userId, profileData) => {
  const response = await fetch(`${MOCK_API_URL}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

// Order APIs
export const createOrder = async (orderData) => {
  const response = await fetch(`${MOCK_API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  return handleResponse(response);
};

// Sell APIs
export const createSellRequest = async (sellData) => {
  const response = await fetch(`${MOCK_API_URL}/sell`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sellData),
  });
  return handleResponse(response);
};

export const getSellHistory = async (userId) => {
  const response = await fetch(`${MOCK_API_URL}/sell?userId=${userId}`);
  return handleResponse(response);
};

export const cancelSellRequest = async (sellId) => {
  const response = await fetch(`${MOCK_API_URL}/sell/${sellId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Cancelled" }),
  });
  return handleResponse(response);
};

// Exchange APIs
export const createExchangeRequest = async (exchangeData) => {
  const response = await fetch(`${EXCHANGE_API_URL}/exchanges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exchangeData),
  });
  return handleResponse(response);
};

export const getExchangeHistory = async (userId) => {
  const response = await fetch(`${EXCHANGE_API_URL}/exchanges/user/${userId}`);
  return handleResponse(response);
};

export const verifyOtp = async (otpCode) => {
  if (!otpCode) {
    throw new Error("OTP code is required");
  }

  try {
    const response = await fetch(`${EXCHANGE_API_URL}/api/user/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ OtpCode: otpCode }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to verify OTP";
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      return { message: text };
    }
  } catch (error) {
    throw new Error(error.message || "Failed to verify OTP");
  }
};
