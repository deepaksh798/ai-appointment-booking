"use client";

import React, { useState, useEffect } from "react";
import { Calendar, User, LogOut, ChevronDown } from "lucide-react";
import { getUserProfile } from "@/network/Api";
import { removeToken } from "@/_utils/cookies";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    console.log("Logging out...");
    setUserProfile(null);
    removeToken();
    router.push("/login");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        console.log("User Profile:", profile?.data);
        setUserProfile(profile?.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Set userProfile to null but still allow logout functionality
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Get display name - fallback to "User" if profile not available
  const getDisplayName = () => {
    if (userProfile?.name) return userProfile.name;
    return "User";
  };
  const getDisplayEmail = () => {
    if (userProfile?.email) return userProfile.email;
    return "User";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Scheduler</h1>
              <p className="text-sm text-gray-600">Smart appointment booking</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{getDisplayName()}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {getDisplayName()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getDisplayEmail()}
                          </p>
                          {!userProfile && (
                            <p className="text-xs text-orange-500 mt-1 flex items-center">
                              <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                              Profile not loaded
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default NavBar;