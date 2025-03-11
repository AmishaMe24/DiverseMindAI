import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post("http://localhost:8000/auth/signup", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.detail || "Signup failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <h1 className="text-2xl font-semibold text-center">Create Account</h1>
        <p className="text-gray-600 text-center text-sm mt-1">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 hover:underline">Sign in</a>
        </p>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <form onSubmit={handleSignup} className="mt-6">
          <input type="text" placeholder="First Name" required className="w-full p-3 border rounded-lg mb-3" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input type="text" placeholder="Last Name" required className="w-full p-3 border rounded-lg mb-3" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input type="email" placeholder="Email" required className="w-full p-3 border rounded-lg mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-3 border rounded-lg mb-3" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirm Password" required className="w-full p-3 border rounded-lg" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

          <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
