import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faLeaf, faHandshake, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: faMoneyBillWave,
    title: "Save Big",
    description: "Buy used books at unbeatable prices or sell your own to earn cash.",
  },
  {
    icon: faLeaf,
    title: "Go Green",
    description: "Reuse books to reduce waste and support a sustainable future.",
  },
  {
    icon: faHandshake,
    title: "Seamless Exchange",
    description: "Swap books effortlessly with readers near and far.",
  },
  {
    icon: faBookOpen,
    title: "Endless Variety",
    description: "Discover books of all genres, from classics to modern hits.",
  },
];

const BenefitsSection = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.2,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-blue-800 mb-12"
        >
          Why Shop with BookStore?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={benefit.icon}
                  className="text-6xl text-blue-600 bg-blue-100 p-4 rounded-full transition-colors duration-300 hover:bg-blue-200"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;