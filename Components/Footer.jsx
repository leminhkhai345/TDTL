import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import logo from "../src/assets/book-shop.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: Handle newsletter subscription
    alert(`Subscribed with ${email}`);
    setEmail("");
  };

  return (
    <footer className="bg-blue-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img src={logo} alt="BookStore Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold">BookStore</span>
          </div>
          <p className="text-sm">
            Your one-stop platform for buying, selling, and exchanging used books. Save money and read sustainably.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-yellow-300">
                Home
              </a>
            </li>
            <li>
              <a href="/browse" className="hover:text-yellow-300">
                Browse Books
              </a>
            </li>
            <li>
              <a href="/exchange" className="hover:text-yellow-300">
                Exchange
              </a>
            </li>
            <li>
              <a href="/sell" className="hover:text-yellow-300">
                Sell a Book
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Hanoi, Vietnam
            </li>
            <li>
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              +84 123 456 789
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              support@bookstore.com
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg en-semibold mb-3">Stay Connected</h3>
          <div className="flex space-x-4 text-xl mb-4">
            <a href="#" className="hover:text-yellow-300">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="#" className="hover:text-yellow-300">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="#" className="hover:text-yellow-300">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
          </div>
          <h3 className="text-lg font-semibold mb-3">Newsletter</h3>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 text-gray-800 rounded-l-lg focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white px-4 py-2 rounded-r-lg hover:bg-yellow-600"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className="mt-10 text-center text-sm text-gray-300">
        &copy; {new Date().getFullYear()} BookStore. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;