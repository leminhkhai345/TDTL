// components/BookCarousel.jsx
import { useEffect, useRef } from "react";

const books = [
  { title: "Atomic Habits", author: "James Clear", image: "https://picsum.photos/seed/book1/200/300" },
  { title: "The Alchemist", author: "Paulo Coelho", image: "https://picsum.photos/seed/book2/200/300" },
  { title: "1984", author: "George Orwell", image: "https://picsum.photos/seed/book3/200/300" },
  { title: "To Kill a Mockingbird", author: "Harper Lee", image: "https://picsum.photos/seed/book4/200/300" },
  { title: "Sapiens", author: "Yuval Noah Harari", image: "https://picsum.photos/seed/book5/200/300" },
  { title: "Educated", author: "Tara Westover", image: "https://picsum.photos/seed/book6/200/300" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", image: "https://picsum.photos/seed/book7/200/300" },
];

const BookCarousel = () => {
  const carouselRef = useRef(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const clone = () => {
      // Clone the children to make seamless infinite scroll
      const children = [...carousel.children];
      children.forEach((child) => {
        const cloneNode = child.cloneNode(true);
        carousel.appendChild(cloneNode);
      });
    };

    clone();

    let animationFrame;
    const scrollStep = 0.31;

    const scroll = () => {
      if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
        carousel.scrollLeft = 0;
      } else {
        carousel.scrollLeft += scrollStep;
      }
      animationFrame = requestAnimationFrame(scroll);
    };

    scroll();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* <h3 className="text-2xl font-bold text-blue-700 mb-6">Featured Books</h3> */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
        >
          {books.map((book, index) => (
            <div
              key={index}
              className="min-w-[200px] flex-shrink-0 bg-white rounded-xl shadow p-4 text-center"
            >
              <img
                src={book.image}
                alt={book.title}
                className="h-48 w-full object-cover rounded mb-4"
              />
              <h4 className="font-semibold text-blue-800">{book.title}</h4>
              <p className="text-sm text-gray-600">by {book.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookCarousel;
