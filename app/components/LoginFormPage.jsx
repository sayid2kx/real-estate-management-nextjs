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
        setMsg("Invalid Credentials");
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
    <div className="bg-cyan-100 min-h-screen flex flex-col">
      <NavbarSection />
      <div className="flex-grow flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold mb-8 text-green-800">
          {userType === "buyer" ? "Buyer Login Page" : "Seller Login Page"}
        </h1>
        <div className="bg-white shadow-lg p-8 rounded-lg max-w-md w-full border-t-4 border-green-400">
          <h2 className="text-2xl font-bold mb-8 text-green-800 text-center">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              type="text"
              placeholder="Username or Email"
              className="px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={usernameOrEmail}
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={password}
            />
            <button
              type="submit"
              className="bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            >
              Login
            </button>
            {msg && (
              <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md mt-4 text-center">
                {msg}
              </div>
            )}

            <p className="mt-6 text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link
                href={`/${userType}/register`}
                className="underline text-green-600 text-xl hover:text-green-800"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div className="h-20">
        <FooterSection />
      </div>
    </div>
  );
}
