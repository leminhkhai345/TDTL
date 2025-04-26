import React, { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { toast } from "react-toastify";

const SellHistoryPage = () => {
  const [sellItems, setSellItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchSellItems = async () => {
    if (!user) {
      setError("Please log in to view sell history.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://680d2126c47cb8074d8fa188.mockapi.io/sell?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sell history");
      }
      const data = await response.json();
      setSellItems(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const cancelSell = async (sellId) => {
    try {
      const response = await fetch(`https://680d2126c47cb8074d8fa188.mockapi.io/sell/${sellId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (!response.ok) {
        throw new Error("Failed to cancel sell request");
      }
      setSellItems((prev) =>
        prev.map((item) =>
          item.id === sellId ? { ...item, status: "Cancelled" } : item
        )
      );
      toast.success("Sell request cancelled successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchSellItems();
  }, [user]);

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-6">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Sell History</h1>
      {sellItems.length === 0 ? (
        <p className="text-center text-gray-600">No sell requests found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Book Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Author</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Condition</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Submitted At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.author}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.condition}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === "Listed"
                          ? "bg-blue-100 text-blue-800"
                          : item.status === "Sold"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.status === "Listed" && (
                      <button
                        onClick={() => cancelSell(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellHistoryPage;