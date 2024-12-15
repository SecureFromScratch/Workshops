import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RecipesPage from "./pages/RecipesPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const [username, setUsername] = useState(""); // Track loading state

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch("/api/check-auth", { credentials: "include" }); // Include cookies in the request
        if (response.ok) {
          const authCheckResult = await response.json();
          setIsAuthenticated(authCheckResult.authenticated);
          if (authCheckResult.authenticated) {
            setUsername(authCheckResult.username);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Stop loading once check is complete
      }
    };
    checkAuthentication();
  }, [username]);

  const handleLogin = (newUsername) => {
    setIsAuthenticated(true);
    setUsername(newUsername);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
  };
  
  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while authentication is being checked
  }

  return (
    <Router>
      <div>
        <Routes>
          {/* Login route */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

          {/* Redirect the root URL (/) to /recipes */}
          <Route path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/recipes" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Recipes route */}
          <Route
            path="/recipes"
            element={
              isAuthenticated ? (
                <RecipesPage onLogout={handleLogout} username={username} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
