
import React from "react";
import BookCarousel from "./BookCarousel";

const FeaturedBooks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Featured Books</h2>
        <BookCarousel /> {/* Carousel hiển thị sách nổi bật */}
      </div>
    </section>
  );
};

export default FeaturedBooks;
