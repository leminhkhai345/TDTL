import React, { useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { toast } from "react-toastify";

const SellForm = () => {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("Good");
  const [price, setPrice] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a sell request.");
      return;
    }

    const sellData = {
      userId: user.id,
      title: bookTitle,
      author: bookAuthor,
      description,
      condition,
      price: parseFloat(price),
      contactInfo,
      status: "Listed", // Trạng thái mặc định
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("https://680d2126c47cb8074d8fa188.mockapi.io/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit sell request");
      }

      toast.success("Sell request submitted successfully!");
      setBookTitle("");
      setBookAuthor("");
      setDescription("");
      setCondition("Good");
      setPrice("");
      setContactInfo("");
      setError("");
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label className="block font-medium mb-1">Book Title</label>
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Author</label>
        <input
          type="text"
          value={bookAuthor}
          onChange={(e) => setBookAuthor(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Condition</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Price ($)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Contact Information</label>
        <input
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Submit Sell Request
      </button>
    </form>
  );
};

export default SellForm;