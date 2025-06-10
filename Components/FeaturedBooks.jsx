import React from "react";
import { Link } from "react-router-dom";
import BookCarousel from "./BookCarousel";
import { motion } from "framer-motion";

const FeaturedBooks = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.3,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.section
      className="py-16 bg-gray-50"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div variants={titleVariants} className="text-center mb-8">
          <h2 className="text-4xl font-bold text-blue-800">Featured Books</h2>
          <p className="text-gray-600 mt-2">
            Explore our handpicked selection of bestsellers and hidden gems.
          </p>
        </motion.div>
        <motion.div variants={titleVariants}>
          <BookCarousel />
        </motion.div>
        <div className="text-center mt-8">
          <Link
            to="/browse"
            className="inline-flex items-center bg-blue-600 text-white text-base px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            View All Books
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturedBooks;