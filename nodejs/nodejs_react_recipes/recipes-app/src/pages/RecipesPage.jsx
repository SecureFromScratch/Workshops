import React, { useState, useEffect } from "react";
import RecipesCatalog from "./components/RecipesCatalog";
import AddRecipe from "./components/AddRecipe";
import PropTypes from "prop-types";
import "./RecipesPage.css";

function RecipesPage({ onLogout, username }) {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        onLogout(); // Notify parent about logout
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const [recipes, setRecipes] = useState([]);

  console.log("init recipes page");

  // Fetch recipes from the backend
  useEffect(() => {
    console.log("asking for recipes");
    fetch("/api/recipes")
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch((error) => console.error("Error fetching recipes:", error));
  }, []);

  // Handler to update recipes after adding a new recipe
  const refreshRecipes = () => {
    console.log("refresh recipes");
    fetch("/api/recipes")
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch((error) => console.error("Error fetching recipes:", error));
  };

  return (
    <div>
      {/* Page Header */}
      <header className="app-header">
        <h1 className="app-title">{username}, Welcome to The #1 Recipes App</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <table>
        <tbody>
          <tr>
            {/* Recipes Catalog */}
            <td width="60%">
              <RecipesCatalog recipes={recipes} />
            </td>

            {/* Add Recipe */}
            <td valign="top">
              <AddRecipe onRecipeAdded={refreshRecipes} />
            </td>
          </tr>
        </tbody>
      </table>
      <footer className="recipe-page-footer"><a href="https://iconscout.com/icons/gemstone" target="_blank">Gemstone</a> by <a href="https://iconscout.com/contributors/wtf-icon">Cuby Design</a> on <a href="https://iconscout.com">IconScout</a></footer>
    </div>
  );
}

RecipesPage.propTypes = {
  onLogout: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};

export default RecipesPage;
