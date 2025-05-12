// import { LoginRequest } from "../types/auth";
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
    console.log("Sending login request:", { email }); // Ghi log để debug
    const response = await fetch(`${EXCHANGE_API_URL}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, Password: password }),
    });

    const data = await handleResponse(response);

    // Kiểm tra Token (hỗ trợ cả Token và token để tránh lỗi viết hoa)
    const token = data.Token || data.token;
    if (!token) {
      console.error("No token found in response:", data);
      throw new Error(data.ErrorMessage || "Authentication failed: No token received");
    }

    // Giải mã JWT để lấy email và role
    const decodedToken = decodeJwt(token);
    if (!decodedToken) {
      console.error("Failed to decode token:", token);
      throw new Error("Failed to decode authentication token");
    }

    const userData = {
      Token: token,
      email: decodedToken.email || email, // Lấy email từ token, fallback về email đầu vào
      role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'user', // Lấy role từ claim
    };

    console.log("Login successful:", userData); // Ghi log để debug
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








// Mock data cho Category Admin
let mockCategories = [
  { id: '1', name: 'Fiction', description: 'Fictional literature', status: 'active' },
  { id: '2', name: 'Sci-Fi', description: 'Science fiction books', status: 'active' },
  { id: '3', name: 'Romance', description: 'Romantic novels', status: 'inactive' },
];

// Mock data cho Books
let mockBooks = [
  {
    id: '1',
    title: 'Sample Fiction Book',
    author: 'John Doe',
    price: 10.99,
    genre: 'Fiction',
    status: 'pending',
    bookImage: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Sci-Fi Adventure',
    author: 'Jane Doe',
    price: 15.50,
    genre: 'Sci-Fi',
    status: 'approved',
    bookImage: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    title: 'Romantic Novel',
    author: 'Alice Smith',
    price: 12.75,
    genre: 'Romance',
    status: 'rejected',
    bookImage: 'https://via.placeholder.com/150',
  },
];

// API quản lý Category Admin


// API quản lý sách (Admin)
export const getBooks = async () => {
  try {
    checkAdminAccess();
    // Khi có API thật, thay bằng:
    // const response = await fetch(`${MOCK_API_URL}/admin/books`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    //   },
    // });
    // const data = await handleResponse(response);
    // return {
    //   books: data.books || data,
    //   total: data.total || (Array.isArray(data) ? data.length : 0),
    // };

    // Mock data
    return {
      books: mockBooks,
      total: mockBooks.length,
    };
  } catch (error) {
    throw new Error(`Failed to fetch books: ${error.message}`);
  }
};

export const deleteBook = async (bookId) => {
  try {
    checkAdminAccess();
    mockBooks = mockBooks.filter((book) => book.id !== bookId);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete book: ${error.message}`);
  }
};

export const approveBook = async (bookId, status) => {
  try {
    checkAdminAccess();
    mockBooks = mockBooks.map((book) =>
      book.id === bookId ? { ...book, status } : book
    );
    return mockBooks.find((book) => book.id === bookId);
  } catch (error) {
    throw new Error(`Failed to approve/reject book: ${error.message}`);
  }
};

// Các API khác (giữ nguyên, chỉ liệt kê một phần)
export const getBookDetails = async (bookId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch book details: ${error.message}`);
  }
};

const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    token: "mock_jwt_admin_token_123",
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    role: "user",
    token: "mock_jwt_user_token_456",
  },
];
// export const loginUser = async (email, password) => {
//   try {
//     // Tìm người dùng trong danh sách mock
//     const user = mockUsers.find(
//       (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
//     );

//     if (!user) {
//       // Mô phỏng phản hồi lỗi từ BE
//       throw new Error("Invalid email or password");
//     }

//     // Trả về token và thông tin người dùng (mô phỏng phản hồi thành công từ BE)
//     return {
//       Token: user.token,
//       email: user.email,
//       role: user.role,
//     };
//   } catch (error) {
//     console.error("Login failed:", error);
//     throw new Error(error.message || "Failed to login");
//   }
// };


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


// Cập nhật tài liệu (dùng để hủy hoặc chỉnh sửa yêu cầu bán)
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
    console.error('Update document failed:', error);
    throw new Error(error.message || 'Failed to update document');
  }
};

// Xóa tài liệu
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
    console.error('Delete document failed:', error);
    throw new Error(error.message || 'Failed to delete document');
  }
};


// Lấy danh sách tài liệu đang được liệt kê
export const getListedDocuments = async () => {
  try {
    const response = await fetch(`${EXCHANGE_API_URL}/api/Documents/listed`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await handleResponse(response);
    return data.documents || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch listed documents');
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
    console.log('Creating category with data:', categoryData);
    checkAdminAccess();
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
      body: JSON.stringify({ categoryName: categoryData.name }),
    });
    console.log('Response status:', response.status);
    const data = await handleResponse(response);
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Create category error:', error.message);
    throw new Error(error.message || 'Failed to create admin category');
  }
};

export const updateAdminCategory = async (categoryId, categoryData) => {
  try {
    checkAdminAccess();
    const response = await fetch(`${EXCHANGE_API_URL}/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({ categoryId, categoryName: categoryData.name }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
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

