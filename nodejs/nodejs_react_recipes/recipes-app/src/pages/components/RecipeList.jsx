import React from "react";
import PropTypes from "prop-types";
import TagsPanel from "./TagsPanel";

function RecipeList({ recipes }) {
  return (
    <ul className="recipes">
      {recipes.map((recipe) => (
        <li className="recipe-item" key={recipe.id}>
          <div className="recipe">
            <div className="recipe-header">
              {recipe.base64Image && (
                <img className="recipe-image" src={`${recipe.base64Image}`} alt={recipe.name} />
              )}
              <TagsPanel recipeId={recipe.id} initialTags={recipe.tags} initialMyVotes={recipe.myVotes} />
            </div>
            <div className="recipe-info">
              <div className="Name">{recipe.name}</div>
              {/* Conditional rendering for instructions or premium message */}
              {recipe.instructions ? (
                <div
                  className="Instructions"
                  dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                />
              ) : recipe.isPremium ? (
                <div><div className="premium-message">
                  <img
                    src="/assets/images/gemstone.svg" // Replace with a valid URL for an icon
                    alt="Premium"
                    className="premium-icon"
                  />
                  Premium Recipe - for Subscribers Only
                </div><a href="#" className="buy-subscription">Buy Subscription</a></div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

RecipeList.propTypes = {
    recipes: PropTypes.array.isRequired,
};

export default RecipeList;
