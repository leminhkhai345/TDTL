// src/components/Features.jsx
import React from "react";

const Features = () => (
  <section className="py-16 bg-gray-100">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">
        Why Use Library Exchange?
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Save Money</h3>
          <p className="text-gray-600">
            Buy used books at affordable prices or exchange them with others.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Discover Rare Books</h3>
          <p className="text-gray-600">
            Find limited editions and out-of-print titles from fellow readers.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Community Driven</h3>
          <p className="text-gray-600">
            Join a community of book lovers who care about reading and sharing.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
