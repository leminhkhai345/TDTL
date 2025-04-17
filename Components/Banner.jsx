// src/components/Banner.jsx
import React from "react";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <section className="relative bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto py-16 px-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Buy and Exchange Books</h1>
          <p className="mt-4 text-lg">A platform for book lovers to buy and exchange books</p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/login"
              className="inline-block text-center bg-white text-blue-600 px-6 py-3 font-semibold rounded-lg hover:bg-gray-100"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
