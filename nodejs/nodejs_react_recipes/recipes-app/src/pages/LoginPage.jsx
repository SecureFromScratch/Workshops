import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import "./LoginPage.css";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState(Cookies.get("user") || "");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // React Router's navigation hook

  const handleRegistration = async (event) => {
    handleSessionCreation(event, "register");
  };

  const handleLogin = async (event) => {
    handleSessionCreation(event, "login");
  };

  const handleSessionCreation = async (event, apiRoute) => {
    event.preventDefault();
    createCookie(username);
    try {
      const response = await fetch(`/api/${apiRoute}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        onLogin((await response.json()).username); // Notify parent about successful login
        navigate("/recipes");
      } else {
        setError("Invalid login. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  const createCookie = (username) => {
    Cookies.set("user", username, { // client side cookie creation
      expires: 7 // Expires in 7 days
    });
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Welcome to The #1 Recipes App</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <button type="button" className="register-button" onClick={handleRegistration}>Register</button>
          <button type="submit" className="login-button">Login</button>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
      <footer className="login-footer">
        Created by <a href="https://securefromscratch.com" target="_blank" rel="noopener noreferrer">Secure From Scratch</a>
      </footer>
    </div>
  );
}

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default LoginPage;
