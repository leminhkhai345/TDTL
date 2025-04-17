import React from 'react';

const ShopNowPage = () => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Header Section */}
      <header className="bg-black py-6">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-3xl text-yellow-500">Book Store</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/" className="hover:text-yellow-500">Home</a></li>
              <li><a href="/about" className="hover:text-yellow-500">About</a></li>
              <li><a href="/contact" className="hover:text-yellow-500">Contact</a></li>
              <li><a href="/login" className="hover:text-yellow-500">Login</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Shop Now Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl text-yellow-500 mb-8">Shop Our Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Product Item 1 */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <img src="book1.jpg" alt="Book 1" className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book Title 1</h3>
              <p className="text-sm">A short description of the book goes here.</p>
              <button className="bg-yellow-500 text-gray-800 p-2 rounded-md hover:bg-yellow-600 mt-4">Add to Cart</button>
            </div>
            {/* Product Item 2 */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <img src="book2.jpg" alt="Book 2" className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book Title 2</h3>
              <p className="text-sm">A short description of the book goes here.</p>
              <button className="bg-yellow-500 text-gray-800 p-2 rounded-md hover:bg-yellow-600 mt-4">Add to Cart</button>
            </div>
            {/* Product Item 3 */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <img src="book3.jpg" alt="Book 3" className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book Title 3</h3>
              <p className="text-sm">A short description of the book goes here.</p>
              <button className="bg-yellow-500 text-gray-800 p-2 rounded-md hover:bg-yellow-600 mt-4">Add to Cart</button>
            </div>
            {/* Product Item 4 */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <img src="book4.jpg" alt="Book 4" className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book Title 4</h3>
              <p className="text-sm">A short description of the book goes here.</p>
              <button className="bg-yellow-500 text-gray-800 p-2 rounded-md hover:bg-yellow-600 mt-4">Add to Cart</button>
            </div>
          </div>
        </div>
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

export default ShopNowPage;
