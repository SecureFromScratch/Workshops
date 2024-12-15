import React from "react";
import PropTypes from "prop-types";

function RecipesFilter({ filter, onFilterChange }) {
  return (
    <div className="filter">
      <label htmlFor="filter">Filter Recipes:</label>
      <div className="filter-input-wrapper">
        <input
          type="text"
          id="filter"
          value={filter}
          onChange={onFilterChange}
          placeholder="Enter a recipe name..."
        />
        <i className="fa fa-search" />
      </div>
    </div>
  );
}

RecipesFilter.propTypes = {
    filter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired,
};

export default RecipesFilter;
