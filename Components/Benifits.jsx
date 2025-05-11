import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faLeaf, faHandshake, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: faMoneyBillWave,
    title: "Tiết kiệm chi phí",
    description: "Mua sách với giá rẻ hơn và bán lại sách cũ để tiết kiệm.",
  },
  {
    icon: faLeaf,
    title: "Bảo vệ môi trường",
    description: "Tái sử dụng sách giúp giảm lượng rác thải và bảo vệ môi trường.",
  },
  {
    icon: faHandshake,
    title: "Trao đổi dễ dàng",
    description: "Kết nối với những người có nhu cầu trao đổi sách nhanh chóng.",
  },
  {
    icon: faBookOpen,
    title: "Kho sách phong phú",
    description: "Tìm thấy đủ loại sách học tập, kỹ năng, tiểu thuyết,...",
  },
];

const BenefitsSection = () => {
  // Hiệu ứng animation cho các card
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
          className="text-4xl font-bold text-center text-blue-800 mb-12 drop-shadow-md"
        >
          Lợi ích khi sử dụng BookStore
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
              <div className="relative inline-block mb-4">
                <FontAwesomeIcon
                  icon={benefit.icon}
                  className="text-5xl text-blue-600 bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-full"
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