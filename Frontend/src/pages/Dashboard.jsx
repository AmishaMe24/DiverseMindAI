import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8000/auth/logout", { withCredentials: true });
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      {user ? (
        <div>
          <img src={user.picture} alt="User Profile" />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;