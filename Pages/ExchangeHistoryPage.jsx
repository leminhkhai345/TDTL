import React, { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";

const ExchangeHistoryPage = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchExchanges = async () => {
    if (!user) {
      setError("Please log in to view exchange history.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5041/api/exchanges/user/${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch exchange history");
      }
      const data = await response.json();
      setExchanges(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, [user]);

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-6">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Exchange History</h1>
      {exchanges.length === 0 ? (
        <p className="text-center text-gray-600">No exchange requests found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Book Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Author</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Condition</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {exchanges.map((exchange) => (
                <tr key={exchange.id} className="border-b">
                  <td className="px-6 py-4 text-sm text-gray-900">{exchange.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{exchange.author}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{exchange.condition}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        exchange.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : exchange.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {exchange.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(exchange.createdAt).toLocaleDateString()}
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

export default ExchangeHistoryPage;