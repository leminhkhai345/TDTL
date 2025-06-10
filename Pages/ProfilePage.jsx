import React, { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUserProfile, updateUserProfile } from "../src/API/api";
import Footer from "../Components/Footer";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    address: "",
    birth: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankName: "",
    bankBranch: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const userData = await getUserProfile();
        setProfile({
          fullName: userData.fullName || "",
          phone: userData.phone || "",
          address: userData.address || "",
          birth: userData.birth ? new Date(userData.birth).toISOString().split("T")[0] : "",
          bankAccountNumber: userData.bankAccountNumber || "",
          bankAccountName: userData.bankAccountName || "",
          bankName: userData.bankName || "",
          bankBranch: userData.bankBranch || "",
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error(err.message);
      }
    };

    fetchProfileData();
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!profile.fullName) newErrors.fullName = "Full name is required";
    if (profile.fullName.length > 255) newErrors.fullName = "Full name must be less than 255 characters";
    if (profile.phone && !/^\d{10,20}$/.test(profile.phone)) {
      newErrors.phone = "Phone number must be 10-20 digits";
    }
    if (profile.address && profile.address.length > 500) {
      newErrors.address = "Address must be less than 500 characters";
    }
    if (profile.birth && new Date(profile.birth) > new Date()) {
      newErrors.birth = "Birth date must be today or earlier";
    }
    if (profile.bankAccountNumber && profile.bankAccountNumber.length > 50) {
      newErrors.bankAccountNumber = "Bank account number must be less than 50 characters";
    }
    if (profile.bankAccountName && profile.bankAccountName.length > 100) {
      newErrors.bankAccountName = "Bank account name must be less than 100 characters";
    }
    if (profile.bankName && profile.bankName.length > 100) {
      newErrors.bankName = "Bank name must be less than 100 characters";
    }
    if (profile.bankBranch && profile.bankBranch.length > 100) {
      newErrors.bankBranch = "Bank branch must be less than 100 characters";
    }
    return newErrors;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const updatedProfile = await updateUserProfile({
        fullName: profile.fullName,
        phone: profile.phone || null,
        address: profile.address || null,
        birth: profile.birth || null,
        bankAccountNumber: profile.bankAccountNumber || null,
        bankAccountName: profile.bankAccountName || null,
        bankName: profile.bankName || null,
        bankBranch: profile.bankBranch || null,
      });
      setUser({ ...user, ...updatedProfile });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 text-lg font-medium">Please log in to view your profile.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all duration-200"
        >
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600 text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-12 text-lg">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">Profile Settings</h1>

      {/* Grid layout 1/3 và 2/3 */}
      <div className="grid grid-cols-3 gap-8">
        {/* Your Profile (1/3) */}
        <div className="col-span-1 bg-white rounded-xl shadow-lg p-8 border-r-2 border-blue-600 min-h-[500px]">
          <h2 className="text-2xl font-semibold mb-6 text-blue-800">Your Profile</h2>
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-semibold text-gray-600 border-4 border-gray-200">
              {user.email[0].toUpperCase()}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Name: </span>
              {profile.fullName || user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Email: </span>
              {user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Phone: </span>
              {profile.phone || "Not provided"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Address: </span>
              {profile.address || "Not provided"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Birthday: </span>
              {profile.birth ? new Date(profile.birth).toLocaleDateString() : "Not provided"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Bank Account: </span>
              {profile.bankAccountNumber
                ? `${profile.bankAccountNumber} (${profile.bankBranch || "No branch"})`
                : "Not provided"}
            </p>
          </div>
        </div>

        {/* Personal Information (2/3) */}
        <div className="col-span-2 bg-white rounded-xl shadow-lg p-8 min-h-[500px]">
          <h2 className="text-2xl font-semibold mb-6 text-blue-800">Personal Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Cột trái: Full Name, Phone Number, Address, Birth Date */}
              <div className="space-y-6">
                <div className="relative">
                  <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  />
                  {errors.fullName && <p className="text-red-600 text-sm mt-1 italic">{errors.fullName}</p>}
                </div>
                <div className="relative">
                  <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1 italic">{errors.phone}</p>}
                </div>
                <div className="relative">
                  <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Address
                  </label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-1 italic">{errors.address}</p>}
                </div>
                <div className="relative">
                  <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={profile.birth}
                    onChange={(e) => setProfile({ ...profile, birth: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  />
                  {errors.birth && <p className="text-red-600 text-sm mt-1 italic">{errors.birth}</p>}
                </div>
              </div>

              {/* Cột phải: Bank Account Number, Bank Account Name, Bank Name, Bank Branch */}
              <div className="space-y-6">
                <div className="relative">
                  <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={profile.bankAccountNumber}
                    onChange={(e) => setProfile({ ...profile, bankAccountNumber: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  />
                  {errors.bankAccountNumber && (
                    <p className="text-red-600 text-sm mt-1 italic">{errors.bankAccountNumber}</p>
                  )}
                </div>
                <div className="relative">
                  <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Bank Account Name
                  </label>
                  <input
                    type="text"
                    value={profile.bankAccountName}
                    onChange={(e) => setProfile({ ...profile, bankAccountName: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  />
                  {errors.bankAccountName && (
                    <p className="text-red-600 text-sm mt-1 italic">{errors.bankAccountName}</p>
                  )}
                </div>
                <div className="relative">
                  <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={profile.bankName}
                    onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  />
                  {errors.bankName && <p className="text-red-600 text-sm mt-1 italic">{errors.bankName}</p>}
                </div>
                <div className="relative">
                  <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Bank Branch
                  </label>
                  <input
                    type="text"
                    value={profile.bankBranch}
                    onChange={(e) => setProfile({ ...profile, bankBranch: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  />
                  {errors.bankBranch && <p className="text-red-600 text-sm mt-1 italic">{errors.bankBranch}</p>}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all duration-200"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProfilePage;