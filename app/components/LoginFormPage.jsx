"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarSection from "./Navbar";
import FooterSection from "./Footer";

export default function LoginForm({ userType }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        usernameOrEmail,
        password,
        userType,
        redirect: false,
      });

      if (res.error) {
        setMsg("Invalid credentials. Please try again.");
        return;
      }

      router.replace(`/${userType}/dashboard`);
    } catch (error) {
      console.log("Error during login: ", error);
      setMsg("An error occurred during login.");
    }
  };

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 1500);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <NavbarSection />
      <main className="flex-grow flex items-center justify-center p-4 pb-20">
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-8">
            {userType === "seller" ? "Seller Login" : "Buyer Login"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                type="text"
                placeholder="Username or Email"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={usernameOrEmail}
              />
              <label className="absolute left-4 top-0 text-xs font-semibold text-purple-600 transform -translate-y-1/2 bg-white px-1">
                Username or Email
              </label>
            </div>

            <div className="relative">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={password}
              />
              <label className="absolute left-4 top-0 text-xs font-semibold text-purple-600 transform -translate-y-1/2 bg-white px-1">
                Password
              </label>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full w-full hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all transform hover:scale-105"
            >
              Login
            </button>

            {msg && (
              <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md mt-4 text-center animate-pulse">
                {msg}
              </div>
            )}

            <p className="mt-6 text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link
                href={`/${userType}/register`}
                className="font-semibold text-purple-600 hover:text-purple-800 transition-colors"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </main>
      <div className="h-16">
        <FooterSection />
      </div>
    </div>
  );
}
