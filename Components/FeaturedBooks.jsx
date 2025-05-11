import React from "react";
import BookCarousel from "./BookCarousel";
import { motion } from 'framer-motion';

const FeaturedBooks = () => {
  // Hiệu ứng animation cho section
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
      className="py-16 bg-white"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          variants={titleVariants}
          className="text-4xl font-bold text-blue-700 mb-6 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent text-center"
        >
          Featured Books
        </motion.h2>
        <motion.div variants={titleVariants}>
          <BookCarousel />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturedBooks;