"use client";

import React, { useState } from "react";
import { Calendar, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginApi, signupApi } from "@/network/Api";
import { setToken } from "@/_utils/cookies";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Login form validation schema
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  // Signup form validation schema
  const signupSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  });

  // Login form
  const loginFormik: any = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        const payload = {
          email: values.email,
          password: values.password,
        };
        console.log("Login payload:", payload);

        await loginApi(payload).then((response) => {
          console.log("Login response:", response);
          if (response.status === 200) {
            // Store token or handle successful login
            setToken(response.data.token);
            console.log("Token set successfully", response.data.token);
            router.push("/home"); // Redirect to home after signup
          } else {
            throw new Error("Login failed");
          }
        });
        // Handle successful login
        console.log("Login successful");
      } catch (error) {
        console.error("Login error:", error);
        // Handle login error
      } finally {
        setLoading(false);
      }
    },
  });

  // Signup form
  const signupFormik: any = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupSchema,
    onSubmit: async (values: any) => {
      setLoading(true);
      try {
        const payload = {
          name: values.name,
          email: values.email,
          password: values.password,
        };
        await signupApi(payload).then((response) => {
          console.log("Signup response:", response);
          if (response.status === 200) {
            setToken(response.data.token);
            router.push("/home");
            toast.success("Signup successful! Welcome to AI Scheduler.");
          } else {
            throw new Error("Signup failed");
          }
        });
        console.log("Signup successful");
      } catch (error) {
        console.error("Signup error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const switchTab = (tab: any) => {
    setActiveTab(tab);
    loginFormik.resetForm();
    signupFormik.resetForm();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Scheduler</h1>
          <p className="text-gray-600 text-sm mt-2">
            Smart appointment booking
          </p>
        </div>

        {/* Auth Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-gray-50 p-1 rounded-t-2xl">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 py-3 px-6 text-center font-medium rounded-lg transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab("signup")}
              className={`flex-1 py-3 px-6 text-center font-medium rounded-lg transition-all duration-200 ${
                activeTab === "signup"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "login" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 text-center">
                    Welcome back
                  </h2>
                  <p className="text-gray-600 text-center mt-2">
                    Sign in to your account to continue
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        value={loginFormik.values.email}
                        onChange={loginFormik.handleChange}
                        onBlur={loginFormik.handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          loginFormik.touched.email && loginFormik.errors.email
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {loginFormik.touched.email && loginFormik.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {loginFormik.errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={loginFormik.values.password}
                        onChange={loginFormik.handleChange}
                        onBlur={loginFormik.handleBlur}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          loginFormik.touched.password &&
                          loginFormik.errors.password
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {loginFormik.touched.password &&
                      loginFormik.errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {loginFormik.errors.password}
                        </p>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={loginFormik.handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "signup" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 text-center">
                    Create your account
                  </h2>
                  <p className="text-gray-600 text-center mt-2">
                    Sign up to get started with AI Scheduler
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="signup-name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name
                    </label>
                    <div className="relative">
                      {/* You can use an icon here if you want */}
                      <input
                        id="signup-name"
                        name="name"
                        type="text"
                        value={signupFormik.values.name}
                        onChange={signupFormik.handleChange}
                        onBlur={signupFormik.handleBlur}
                        className={`w-full pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          signupFormik.touched.name && signupFormik.errors.name
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your name"
                      />
                    </div>
                    {signupFormik.touched.name && signupFormik.errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {signupFormik.errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        value={signupFormik.values.email}
                        onChange={signupFormik.handleChange}
                        onBlur={signupFormik.handleBlur}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          signupFormik.touched.email &&
                          signupFormik.errors.email
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {signupFormik.touched.email &&
                      signupFormik.errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {signupFormik.errors.email}
                        </p>
                      )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={signupFormik.values.password}
                        onChange={signupFormik.handleChange}
                        onBlur={signupFormik.handleBlur}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          signupFormik.touched.password &&
                          signupFormik.errors.password
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {signupFormik.touched.password &&
                      signupFormik.errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {signupFormik.errors.password}
                        </p>
                      )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={signupFormik.values.confirmPassword}
                        onChange={signupFormik.handleChange}
                        onBlur={signupFormik.handleBlur}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          signupFormik.touched.confirmPassword &&
                          signupFormik.errors.confirmPassword
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {signupFormik.touched.confirmPassword &&
                      signupFormik.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {signupFormik.errors.confirmPassword}
                        </p>
                      )}

                    <span></span>
                  </div>

                  <button
                    type="button"
                    onClick={signupFormik.handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 AI Scheduler. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
