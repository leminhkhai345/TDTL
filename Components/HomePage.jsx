import React from 'react';
import { Link } from 'react-router-dom';  // Import Link để điều hướng

const HomePage = () => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Header Section */}
      <header className="bg-black py-6">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-3xl text-yellow-500">Book Store</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><Link to="/" className="hover:text-yellow-500">Home</Link></li>
              <li><Link to="/about" className="hover:text-yellow-500">About</Link></li>
              <li><Link to="/contact" className="hover:text-yellow-500">Contact</Link></li>
              <li><Link to="/login" className="hover:text-yellow-500">Login</Link></li> {/* Sử dụng Link */}
            </ul>
          </nav>
        </div>
      </header>

      {/* Featured Books Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl text-yellow-500 mb-8">Our Featured Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="bg-gray-700 p-4 rounded-lg">
              <img src="book1.jpg" alt="Book 1" className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book Title 1</h3>
              <p className="text-sm">Book description goes here.</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <img src="book2.jpg" alt="Book 2" className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book Title 2</h3>
              <p className="text-sm">Book description goes here.</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <img src="book3.jpg" alt="Book 3" className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book Title 3</h3>
              <p className="text-sm">Book description goes here.</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <img src="book4.jpg" alt="Book 4" className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book Title 4</h3>
              <p className="text-sm">Book description goes here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-yellow-500 text-center">
        <h2 className="text-2xl text-gray-800 font-semibold mb-4">Explore More Books</h2>
        <p className="text-gray-800 mb-6">Find the best books from a wide variety of categories, genres, and authors.</p>
        <Link to="/shop" className="bg-gray-800 text-yellow-500 px-8 py-3 rounded-full text-xl hover:bg-gray-700">Shop Now</Link>
      </section>

      {/* Footer Section */}
      <footer className="bg-black py-6">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; 2025 Book Store. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
