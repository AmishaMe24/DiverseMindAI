import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    
    if (code) {
      setIsLoading(true);
      
      // Send the code to your backend
      axios.post("http://localhost:8000/auth/google/callback", 
        { code }, 
        { withCredentials: true }
      )
      .then(response => {
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/dashboard");
        } else {
          setError("Failed to get user data");
        }
      })
      .catch(err => {
        console.error("Authentication error:", err);
        setError("Authentication failed");
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [location.search, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      setIsLoading(true);
      
      const response = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });
  
      console.log("Login successful:", response.data);
  
      // Store the user details in localStorage as a single object
      localStorage.setItem("user", JSON.stringify({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: email,
        token: response.data.token
      }));
  
      navigate("/dashboard");
  
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <h1 className="text-2xl font-semibold text-center">Sign In</h1>
        <p className="text-gray-600 text-center text-sm mt-1">
          or{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            create an account
          </a>
        </p>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <div className="mt-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full mt-4 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <div className="flex items-center my-6">
          <hr className="w-full border-gray-300" />
          <span className="px-3 text-gray-500">or</span>
          <hr className="w-full border-gray-300" />
        </div>

        <button
          onClick={() => (window.location.href = "http://localhost:8000/auth/google")}
          className="w-full flex items-center justify-center gap-2 border p-3 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <img
            src="https://img.icons8.com/color/16/000000/google-logo.png"
            alt="Google Logo"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;