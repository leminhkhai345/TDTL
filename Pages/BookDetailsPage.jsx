// src/pages/BookDetailsPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

// Giả sử bạn có một mảng sách như dưới đây, bạn có thể thay đổi hoặc lấy từ API nếu cần
const books = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", price: 15, image: "/img/gatsby.jpg" },
  { id: 2, title: "1984", author: "George Orwell", genre: "Dystopian", price: 18, image: "/img/1984.jpg" },
  { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", price: 25, image: "/img/mockingbird.jpg" },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", price: 22, image: "/img/pride.jpg" },
  { id: 5, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", price: 30, image: "/img/hobbit.jpg" },
  { id: 6, title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", price: 17, image: "/img/catcher.jpg" },
  { id: 7, title: "Brave New World", author: "Aldous Huxley", genre: "Sci-Fi", price: 20, image: "/img/brave.jpg" },
  { id: 8, title: "Moby Dick", author: "Herman Melville", genre: "Adventure", price: 28, image: "/img/moby.jpg" },
];

const BookDetailsPage = () => {
  // Lấy bookId từ URL bằng useParams
  const { bookId } = useParams();

  // Tìm cuốn sách với bookId
  const book = books.find((b) => b.id.toString() === bookId);

  if (!book) {
    return <div>Book not found</div>;  // Nếu không tìm thấy sách, hiển thị thông báo lỗi
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="w-1/3">
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-72 object-cover rounded-lg"
          />
        </div>
        <div className="w-2/3">
          <h2 className="text-3xl font-semibold text-blue-800">{book.title}</h2>
          <p className="text-xl text-gray-600">by {book.author}</p>
          <p className="text-sm text-gray-500">{book.genre}</p>
          <p className="mt-4 text-lg">{book.description}</p>
          <p className="mt-4 text-xl font-bold text-blue-600">${book.price}</p>
          <div className="mt-4 flex gap-4">
            <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
              Add to Cart
            </button>
            <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;
