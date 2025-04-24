import React from "react";
import { Link } from "react-router-dom"; // Dẫn đến trang danh sách sách
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons"; // Biểu tượng sách

const Banner = () => {
  return (
    <div className="relative w-full h-96 bg-white overflow-hidden">
      {/* Nội dung Banner */}
      <div className="relative z-10 text-center text-white py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-wide text-blue-900">
          Welcome to BookStore
        </h1>
        <p className="text-lg md:text-xl mb-8 text-blue-700">
          <FontAwesomeIcon icon={faBookOpen} className="mr-2 text-blue-700" />
          Explore a world of books, from fiction to non-fiction, and enjoy a seamless shopping experience.
        </p>

        {/* Nút CTA với biểu tượng sách */}
        <Link
          to="/browse"
          className="bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-500 transition duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
          Explore Books
        </Link>
      </div>
    </div>
  );
};

export default Banner;
