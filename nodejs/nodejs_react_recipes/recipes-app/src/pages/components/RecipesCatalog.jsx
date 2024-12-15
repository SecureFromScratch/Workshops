import React, { useState } from "react";
import RecipesFilter from "./RecipesFilter";
import RecipeList from "./RecipeList";
import PropTypes from "prop-types";
import "./RecipesCatalog.css";

function RecipesCatalog({ recipes }) {
  const [filter, setFilter] = useState("");

  const handleFilterChange = (event) => {
    setFilter(event.target.value.toLowerCase());
  };

  const getFilteredRecipes = () =>
    recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(filter)
    );

  return (
    <div className="container">
      <RecipesFilter filter={filter} onFilterChange={handleFilterChange} />
      <RecipeList recipes={getFilteredRecipes()} />
    </div>
  );
}

RecipesCatalog.propTypes = {
    recipes: PropTypes.array.isRequired,
};

export default RecipesCatalog;

//<object data="http://localhost:5000/uploads/1732707746312-sample.svg" width="300" height="200"></object>
