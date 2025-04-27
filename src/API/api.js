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

// Auth APIs
export const loginUser = async (email, password) => {
  const response = await fetch(
    `${MOCK_API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
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

export const registerUser = async (fullName, email, phone, password) => {
  const response = await fetch(`${MOCK_API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName,
      email,
      phone,
      password,
      createdAt: new Date().toISOString(),
    }),
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