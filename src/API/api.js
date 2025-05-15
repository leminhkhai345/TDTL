const MOCK_API_URL = import.meta.env.VITE_MOCK_API_URL;
const EXCHANGE_API_URL = import.meta.env.VITE_EXCHANGE_API_URL;
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
// Hàm xử lý phản hồi và lỗi
const handleResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `HTTP Error ${response.status}`;
    let errorData = {};
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json();
      errorMessage = errorData.error || errorData.message || JSON.stringify(errorData) || errorMessage;
    } else {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return { message: await response.text() };
};


// Hàm giải mã JWT để lấy payload (không kiểm tra chữ ký)
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};



// Placeholder: Lấy danh sách đánh giá (mock data)
export const getReviewsByBookId = async (bookId) => {
  try {
    // Khi có API thật, thay bằng:
    // const response = await fetch(`${API_URL}/books/${bookId}/reviews`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    //   },
    // });
    // const data = await handleResponse(response);
    // return {
    //   reviews: data.reviews || data,
    //   total: data.total || (Array.isArray(data) ? data.length : 0),
    // };

    // Mock data: Lọc đánh giá theo bookId
    const reviews = mockReviews.filter((review) => review.bookId === bookId);
    return {
      reviews,
      total: reviews.length,
    };
  } catch (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }
};

// Placeholder: Thêm đánh giá mới (mock data)
export const createReview = async (bookId, reviewData) => {
  try {
    // Khi có API thật, thay bằng:
    // const response = await fetch(`${API_URL}/books/${bookId}/reviews`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    //   },
    //   body: JSON.stringify(reviewData),
    // });
    // return handleResponse(response);

    // Mock data: Thêm đánh giá mới vào danh sách
    const newReview = {
      id: String(mockReviews.length + 1),
      ...reviewData,
    };
    mockReviews.push(newReview);
    return newReview;
  } catch (error) {
    throw new Error(`Failed to create review: ${error.message}`);
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


// API đăng nhập
export const loginUser = async (email, password) => {
  try {
    console.log("Sending login request:", { email });
    const response = await fetch(`${EXCHANGE_API_URL}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, Password: password }),
    });

    const data = await handleResponse(response);

    const token = data.Token || data.token;
    if (!token) {
      console.error("No token found in response:", data);
      throw new Error(data.ErrorMessage || "Authentication failed: No token received");
    }

    const decodedToken = decodeJwt(token);
    if (!decodedToken) {
      console.error("Failed to decode token:", token);
      throw new Error("Failed to decode authentication token");
    }

    const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ? decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].toLowerCase()
      : 'user';

    const userData = {
      Token: token,
      email: decodedToken.email || email,
      role: role,
    };

    console.log("Login successful:", userData);
    return userData;
  } catch (error) {
    console.error("Login failed:", error.message, error.stack);
    throw new Error(error.message || "Failed to login");
  }
};
// Hàm Forgot Password
export const forgotPassword = async (email) => {
  try {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Email: email }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Forgot password failed:", error);
    throw new Error(error.message || "Failed to send reset password request");
  }
};



// Hàm Reset Password
export const resetPassword = async (token, newPassword, confirmPassword) => {
  try {
    if (!token) {
      throw new Error("Reset token is required");
    }
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(newPassword)) {
      throw new Error("Password must include uppercase, lowercase, digit, and special character");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Token: token,
        NewPassword: newPassword,
        ConfirmPassword: confirmPassword,
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Reset password failed:", error);
    throw new Error(error.message || "Failed to reset password");
  }
};
// API đăng ký
export const registerUser = async (userData) => {
  try {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      throw new Error("Invalid email format");
    }
    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    if (userData.password !== userData.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: userData.email,
        FullName: userData.fullName,
        Password: userData.password,
        ConfirmPassword: userData.confirmPassword,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to register user";
      let errorData = {};
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
        if (errorData.message?.includes("email")) {
          errorMessage = "Email already exists";
        } else if (errorData.message?.includes("password")) {
          errorMessage = "Password is too weak";
        } else {
          errorMessage = errorData.ErrorMessage || errorData.message || errorData.error || JSON.stringify(errorData) || errorMessage;
        }
      } else {
        errorMessage = await response.text();
      }
      console.error("Register error:", { status: response.status, errorData, errorMessage });
      throw new Error(errorMessage);
    }

    localStorage.setItem("userEmail", userData.email);

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return { status: "success", message: data.message || "Registration successful" };
    } else {
      const text = await response.text();
      return { status: "success", message: text };
    }
  } catch (error) {
    console.error("Register failed:", error);
    throw new Error(error.message || "Failed to register user");
  }
};

// Book APIs (Open Library - đã chuyển từ Google Books)
// export const getBookDetails = async (bookId) => {
//   const response = await fetch(`https://openlibrary.org/works/${bookId}.json`);
//   const data = await handleResponse(response);
//   return {
//     id: bookId,
//     volumeInfo: {
//       title: data.title,
//       authors: data.authors?.map((author) => author.name) || ["Unknown Author"],
//       categories: data.subjects || [],
//       imageLinks: data.covers
//         ? { thumbnail: `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg` }
//         : undefined,
//     },
//     saleInfo: {
//       listPrice: { amount: 0 },
//     },
//   };
// };

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

// API xác minh OTP
export const verifyOtp = async (otpCode) => {
  const email = localStorage.getItem("userEmail");
  if (!email) {
    console.error("No email found in localStorage");
    throw new Error("Không tìm thấy email. Vui lòng đăng ký lại.");
  }
  if (!otpCode || !/^\d{6}$/.test(otpCode)) {
    console.error("Invalid OTP code");
    throw new Error("Mã OTP phải là 6 chữ số.");
  }
  try {
    console.log("Sending OTP verification request:", { Email: email, Otp: otpCode });
    const response = await fetch(`${EXCHANGE_API_URL}/api/Auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Email: email, Otp: otpCode }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Xác minh OTP thất bại.";
      let errorData = {};
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
        if (errorData.message?.includes("expired")) {
          errorMessage = "OTP has expired. Please request a new one.";
        } else if (errorData.message?.includes("invalid")) {
          errorMessage = "Invalid OTP code.";
        } else {
          errorMessage = errorData.ErrorMessage || errorData.message || errorData.error || JSON.stringify(errorData) || errorMessage;
        }
      } else {
        errorMessage = await response.text();
      }
      console.error("Verify OTP error:", { status: response.status, errorData, errorMessage });
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return {
        status: data.status || (data.message && data.message.includes("successful") ? "success" : "error"),
        message: data.message || "Verification successful"
      };
    } else {
      const text = await response.text();
      return { status: "success", message: text };
    }
  } catch (error) {
    console.error("Verify OTP failed:", error);
    throw new Error(error.message || "Xác minh OTP thất bại.");
  }
};

// API gửi OTP
export const sendOtp = async (email) => {
  try {
    console.log("Sending OTP request for email:", email);
    const response = await fetch(`${EXCHANGE_API_URL}/api/user/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Gửi OTP thất bại.";
      let errorData = {};
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
        errorMessage = errorData.ErrorMessage || errorData.message || errorData.error || JSON.stringify(errorData) || errorMessage;
      } else {
        errorMessage = await response.text();
      }
      console.error("Send OTP error:", { status: response.status, errorData, errorMessage });
      throw new Error(errorMessage);
    }
    console.log("Send OTP success");
    return { status: "success" };
  } catch (error) {
    console.error("Send OTP failed:", error);
    throw new Error(error.message || "Gửi OTP thất bại.");
  }
};


// Tạo yêu cầu bán sách mới
export const createDocument = async (documentData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(documentData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Create document failed:', error);
    throw new Error(error.message || 'Failed to create document');
  }
};

// Lấy danh sách sách trong kho của người dùng
export const getMyInventory123 = async (page = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Documents/mine?Page=${page}&PageSize=${pageSize}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    // Ánh xạ dữ liệu để khớp với frontend
    return {
      items: data.items || [],
      total: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 10,
      totalPages: data.totalPages || 0,
    };
  } catch (error) {
    console.error('Get my inventory failed:', error);
    throw new Error(error.message || 'Failed to fetch inventory');
  }
};








// Lấy danh sách danh mục
export const getCategories = async () => {
  try {
    const response = await fetch(`${EXCHANGE_API_URL}/api/Categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch categories');
  }
};


//những thứ liên quan tới ADMIN
const checkAdminAccess = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized: Admin access required');
  }
};


// Lấy danh sách danh mục
export const getAdminCategories = async (search = '') => {
  try {
    checkAdminAccess();
    const response = await fetch(
      `${EXCHANGE_API_URL}/api/admin/categories${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      }
    );
    const data = await handleResponse(response);
    return {
      categories: Array.isArray(data) ? data : data.categories || [],
      total: data.total || (Array.isArray(data) ? data.length : 0),
    };
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.message || 'Failed to fetch admin categories');
  }
};

export const createAdminCategory = async (categoryData) => {
  try {
    if (!categoryData?.name || typeof categoryData.name !== 'string' || categoryData.name.trim().length < 3) {
      throw new Error('Category name must be a string with at least 3 characters');
    }
    checkAdminAccess();
    const token = localStorage.getItem('token');
    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
      body: JSON.stringify({ 
        categoryName: categoryData.name.trim(),
        description: categoryData.description || '',
        status: 'active' // Mặc định là active khi tạo mới
      }),
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Failed to create admin category');
  }
};;

export const updateAdminCategory = async (categoryId, categoryData) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({ 
        categoryId, 
        categoryName: categoryData.name.trim(),
        description: categoryData.description || '',
        status: categoryData.status || 'active'
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Failed to update admin category');
  }
};

export const deleteAdminCategory = async (categoryId) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.message || 'Failed to delete admin category');
  }
};

// Lấy danh sách sách từ /api/Listings
export const getListedDocuments = async (pageNumber = 1, pageSize = 50) => {
  try {
    const response = await fetch(`${EXCHANGE_API_URL}/api/Listings?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await handleResponse(response);
    const items = data.items.map((item) => ({
      listingId: item.listingId,
      documentId: item.documentId,
      title: item.documentTitle || 'Unknown Title',
      author: item.author || 'Unknown Author',
      categoryName: item.categoryName || 'Unknown Category',
      price: item.price !== null ? item.price : (Math.random() * 20 + 5).toFixed(2),
      imageUrl: item.imageUrl || 'https://via.placeholder.com/150', // Giữ giá trị mặc định
      description: item.description || 'No description available',
      createdAt: item.createdAt || new Date().toISOString(),
    }));
    return items;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch listed documents');
  }
};

// Lấy chi tiết một sách từ /api/Listings/{id}
export const getListingById = async (listingId) => {
  try {
    if (!listingId || listingId === 'undefined' || isNaN(parseInt(listingId))) {
      throw new Error('ID listing không hợp lệ');
    }

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Listings/${listingId}`, {
      headers,
    });

    const data = await handleResponse(response);
    return {
      listingId: data.listingId,
      documentId: data.documentId,
      title: data.documentTitle || 'Không rõ tiêu đề',
      ownerName: data.ownerName || 'Người dùng không xác định',
      ownerId: data.ownerId || 0,
      listingType: data.listingType || 0, // 0 = Sell, 1 = Exchange
      price: data.price !== null ? data.price : null,
      description: data.description || 'Không có mô tả',
      listingStatusId: data.listingStatusId || 0,
      statusName: data.statusName || 'Không rõ trạng thái',
      createdAt: data.createdAt || new Date().toISOString(),
      desiredDocumentIds: data.desiredDocumentIds || [],
      acceptedPaymentMethods: data.acceptedPaymentMethods || [],
      rowVersion: data.rowVersion || null,
      imageUrl: data.imageUrl || 'https://via.placeholder.com/150',
      categoryName: data.categoryName || 'Không rõ danh mục',
      author: data.author || 'Không rõ tác giả',
    };
  } catch (error) {
    console.error('Lấy chi tiết listing thất bại:', error);
    throw new Error(error.message || 'Không thể lấy chi tiết listing');
  }
};
//lấy ad
export const adminGetListingById = async (listingId) => {
  try {
    if (!listingId || listingId === 'undefined' || isNaN(parseInt(listingId))) {
      throw new Error('ID listing không hợp lệ');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/listings/${listingId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return {
      listingId: data.listingId,
      documentId: data.documentId,
      title: data.documentTitle || 'Không rõ tiêu đề',
      ownerName: data.ownerName || 'Người dùng không xác định',
      ownerId: data.ownerId || 0,
      listingType: data.listingType || 0,
      price: data.price !== null ? data.price : null,
      description: data.description || 'Không có mô tả',
      listingStatusId: data.listingStatusId || 0,
      statusName: data.statusName || 'Không rõ trạng thái',
      createdAt: data.createdAt || new Date().toISOString(),
      desiredDocumentIds: data.desiredDocumentIds || [],
      acceptedPaymentMethods: data.acceptedPaymentMethods || [],
      rowVersion: data.rowVersion || null,
      imageUrl: data.imageUrl || 'https://via.placeholder.com/150',
      categoryName: data.categoryName || 'Không rõ danh mục',
      author: data.author || 'Không rõ tác giả',
    };
  } catch (error) {
    console.error('Lấy chi tiết listing admin thất bại:', error);
    throw new Error(error.message || 'Không thể lấy chi tiết listing admin');
  }
};
// Lấy danh sách sách trong kho cá nhân từ /api/Documents/mine
export const getMyInventory = async (page = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Documents/mine?Page=${page}&PageSize=${pageSize}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return {
      items: (data.items || []).map((item) => ({
        documentId: item.documentId,
        title: item.title || 'Unknown Title',
        author: item.author || 'Unknown Author',
        categoryName: item.categoryName || 'Unknown Category',
        categoryId: item.categoryId || 0,
        price: item.price !== null ? item.price : null,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
        description: item.description || 'No description available',
        statusName: item.statusName || 'Unknown',
        condition: item.condition || 'Good',
        isbn: item.isbn || null,
        edition: item.edition || null,
        publicationYear: item.publicationYear || null,
      })),
      total: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 10,
      totalPages: data.totalPages || 0,
    };
  } catch (error) {
    console.error('Get my inventory failed:', error); // Log chi tiết lỗi
    throw new Error(error.message || 'Failed to fetch inventory');
  }
};

// Xóa tài liệu từ /api/Documents/{id}
export const deleteDocument = async (documentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Failed to delete document');
  }
};

// Cập nhật tài liệu từ /api/Documents/{id}
export const updateDocument = async (documentId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Failed to update document');
  }
};

// Tạo listing mới từ /api/Listings
export const createListing = async (listingData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(listingData),
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Failed to create listing');
  }
};

// Lấy danh sách listings của người dùng từ /api/Listings
export const getUserListings = async (page = 1, pageSize = 10) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Listings?pageNumber=${page}&pageSize=${pageSize}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return {
      items: (data.items || []).map((item) => ({
        listingId: item.listingId,
        documentId: item.documentId,
        title: item.documentTitle || 'Unknown Title',
        author: item.author || 'Unknown Author',
        categoryName: item.categoryName || 'Unknown Category',
        price: item.price !== null ? item.price : null,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
        description: item.description || 'No description available',
        statusName: item.statusName || 'Unknown',
        createdAt: item.createdAt || new Date().toISOString(),
      })),
      total: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 10,
      totalPages: data.totalPages || 0,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch user listings');
  }
};

// Lấy tất cả tài liệu cho admin
export const getAllDocumentsForAdmin = async (page = 1, pageSize = 50) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Documents?page=${page}&pageSize=${pageSize}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return {
      items: (data.items || []).map((item) => ({
        documentId: item.documentId,
        title: item.title || 'Unknown Title',
        author: item.author || 'Unknown Author',
        categoryName: item.categoryName || 'Unknown Category',
        categoryId: item.categoryId || 0,
        price: item.price !== null ? item.price : null,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
        description: item.description || 'No description available',
        statusName: item.statusName || 'Unknown', // InStock, Listed, etc.
        condition: item.condition || 'Good',
        userId: item.userId || null,
        userName: item.userName || 'Unknown User',
        createdAt: item.createdAt || new Date().toISOString(),
      })),
      total: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 50,
      totalPages: data.totalPages || 0,
    };
  } catch (error) {
    console.error('Get all documents failed:', error);
    throw new Error(error.message || 'Failed to fetch documents for admin');
  }
};

// Duyệt hoặc từ chối listing
export const updateListingStatus = async (listingId, status) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Listings/${listingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ statusName: status }), // Giả định backend chấp nhận statusName
    });

    return handleResponse(response);
  } catch (error) {
    throw new Error(error.message || 'Failed to update listing status');
  }
};
// Lấy danh sách listing types từ /api/metadata/listing-types
export const getListingTypes = async () => {
  try {
    const response = await fetch(`${EXCHANGE_API_URL}/api/metadata/listing-types`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get listing types failed:', error);
    throw new Error(error.message || 'Failed to fetch listing types');
  }
};
// Lấy danh sách listings cho admin
export const getAdminListings = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const query = new URLSearchParams({
      PageNumber: params.pageNumber || 1,
      PageSize: params.pageSize || 10,
      ...(params.status && { Status: params.status }),
      ...(params.sortBy && { SortBy: params.sortBy }),
      ...(params.sortOrder && { SortOrder: params.sortOrder }),
    }).toString();

    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/listings?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return {
      items: (data.items || []).map((item) => ({
        listingId: item.listingId,
        documentId: item.documentId,
        title: item.documentTitle || 'Không rõ tiêu đề',
        author: item.author || 'Không rõ tác giả',
        categoryName: item.categoryName || 'Không rõ danh mục',
        price: item.price !== null ? item.price : null,
        imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
        description: item.description || 'Không có mô tả',
        statusName: item.statusName || 'Không rõ trạng thái',
        ownerName: item.ownerName || 'Người dùng không xác định',
        listingType: item.listingType || 0, // 0 = Sell, 1 = Exchange
        desiredDocumentId: item.desiredDocumentId || null,
        createdAt: item.createdAt || new Date().toISOString(),
        rowVersion: item.rowVersion || null, // Dùng cho kiểm soát đồng thời
      })),
      total: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 10,
      totalPages: data.totalPages || 0,
    };
  } catch (error) {
    console.error('Lấy danh sách listings admin thất bại:', error);
    throw new Error(error.message || 'Không thể lấy danh sách listings admin');
  }
};

// Duyệt listing
export const approveListing = async (listingId, rowVersion) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/listings/${listingId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ RowVersion: rowVersion }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Duyệt listing thất bại:', error);
    throw new Error(error.message || 'Không thể duyệt listing');
  }
};

// Từ chối listing
export const rejectListing = async (listingId, reason, rowVersion) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/listings/${listingId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ Reason: reason, RowVersion: rowVersion }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Từ chối listing thất bại:', error);
    throw new Error(error.message || 'Không thể từ chối listing');
  }
};

//ORDER
export const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Create order failed:', error);
    throw new Error(error.message || 'Failed to create order');
  }
};

export const confirmPayment = async (orderId, proofData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('Proof', proofData.file);
    formData.append('RowVersion', proofData.rowVersion);

    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/${orderId}/confirm-payment`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Confirm payment failed:', error);
    throw new Error(error.message || 'Failed to confirm payment');
  }
};

export const getUserOrderById = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get order details failed:', error);
    throw new Error(`Failed to fetch order details: ${error.message}`);
  }
};

export const rejectOrder = async (orderId, rejectData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/${orderId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(rejectData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Reject order failed:', error);
    throw new Error(`Failed to reject order: ${error.message}`);
  }
};

export const shipOrder = async (orderId, shipData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/${orderId}/ship`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shipData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Ship order failed:', error);
    throw new Error(`Failed to ship order: ${error.message}`);
  }
};

export const deliverOrder = async (orderId, actionData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/${orderId}/deliver`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(actionData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Deliver order failed:', error);
    throw new Error(`Failed to deliver order: ${error.message}`);
  }
};

export const cancelOrder = async (orderId, cancelData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cancelData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Cancel order failed:', error);
    throw new Error(`Failed to cancel order: ${error.message}`);
  }
};


export const confirmMoney = async (orderId, actionData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/${orderId}/confirm-money`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(actionData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Confirm money failed:', error);
    throw new Error(`Failed to confirm money: ${error.message}`);
  }
};

export const getMyPurchases = async (queryParams) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const query = new URLSearchParams({
      page: queryParams.page || 1,
      pageSize: queryParams.pageSize || 10,
      ...(queryParams.statusCode && { statusCode: queryParams.statusCode }),
      ...(queryParams.sortBy && { sortBy: queryParams.sortBy }),
      ...(queryParams.sortOrder && { sortOrder: queryParams.sortOrder }),
    }).toString();
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/my-purchases?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get my purchases failed:', error);
    throw new Error(`Failed to fetch purchases: ${error.message}`);
  }
};

export const getMySales = async (queryParams) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const query = new URLSearchParams({
      page: queryParams.page || 1,
      pageSize: queryParams.pageSize || 10,
      ...(queryParams.statusCode && { statusCode: queryParams.statusCode }),
      ...(queryParams.sortBy && { sortBy: queryParams.sortBy }),
      ...(queryParams.sortOrder && { sortOrder: queryParams.sortOrder }),
    }).toString();
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/my-sales?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get my sales failed:', error);
    throw new Error(`Failed to fetch sales: ${error.message}`);
  }
};

export const confirmOrder = async (orderId, actionData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${EXCHANGE_API_URL}/api/Orders/${orderId}/confirm`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(actionData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Confirm order failed:', error);
    throw new Error(`Failed to confirm order: ${error.message}`);
  }
};