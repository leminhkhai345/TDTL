import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { motion } from 'framer-motion';

const Banner = () => {
  // Hiệu ứng animation cho các thành phần
  const bannerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
        staggerChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-r from-blue-700 to-blue-900 overflow-hidden">
      {/* Hình ảnh nền (minh họa) */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="https://via.placeholder.com/1920x400.png?text=Book+Background"
          alt="Banner Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Nội dung Banner */}
      <motion.div
        className="relative z-10 text-center text-white py-16 px-4"
        variants={bannerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={childVariants}
          className="text-4xl md:text-6xl font-extrabold mb-4 tracking-wide text-white drop-shadow-lg"
        >
          Welcome to BookStore
        </motion.h1>
        <motion.p
          variants={childVariants}
          className="text-lg md:text-xl mb-8 text-white drop-shadow-md"
        >
          <FontAwesomeIcon icon={faBookOpen} className="mr-2 text-yellow-300" />
          Explore a world of books, from fiction to non-fiction, and enjoy a seamless shopping experience.
        </motion.p>

        {/* Nút CTA với hiệu ứng */}
        <motion.div variants={childVariants}>
          <Link
            to="/browse"
            className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-lg px-8 py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
            Explore Books
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Banner;