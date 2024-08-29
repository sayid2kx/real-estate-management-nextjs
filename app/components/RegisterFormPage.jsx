"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm({ role }) {
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const router = useRouter();

  console.log("RegisterForm role:", role); // Debugging line

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname || !email || !phone || !address || !password) {
      setMsg("All fields are necessary.");
      return;
    }

    try {
      // Check if user already exists
      const resUserExists = await fetch(`/api/${role}/userExists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setMsg("User already exists.");
        return;
      }

      // Register new user
      const res = await fetch(`/api/${role}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname,
          email,
          phone,
          address,
          password,
        }),
      });

      if (res.ok) {
        // Reset form and redirect to login page
        setFullName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setPassword("");
        setMsg(""); // Clear message if everything is fine
        router.push(`/${role}/login`);
      } else {
        setMsg("User registration failed.");
      }
    } catch (error) {
      console.error("Error during registration: ", error);
      setMsg("An error occurred during registration.");
    }
  };

  return (
    <div className="bg-green-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Register Your Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
              <input
                type="text"
                name="fullname"
                className="mt-1 p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                value={fullname}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                name="email"
                className="mt-1 p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
              <input
                type="tel"
                name="phone"
                className="mt-1 p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
              <input
                type="password"
                name="password"
                className="mt-1 p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
              <input
                type="text"
                name="address"
                className="mt-1 p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white font-bold py-3 px-6 rounded-md w-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          >
            Register
          </button>
        </form>

        {msg && <div className="text-red-500 mt-3 text-center">{msg}</div>}

        <p className="mt-6 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link
            href={`/${role}/login`}
            className="underline text-green-600 hover:text-green-800"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
