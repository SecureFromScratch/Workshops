import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./AddRecipe.css?no-inline";

function AddRecipe({ onRecipeAdded }) {
  const TINYMCE_APIKEY = "1y2txrzbb9yi55y9qsftdxekakkmjtlot9u3oa7wuilnapdx";
  const [recipe, setRecipe] = useState({ name: "", instructions: "", image: null });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();  
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setRecipe({ ...recipe, [name]: value });
  };

  const handleEditorChange = (content) => {
    setRecipe({ ...recipe, instructions: content });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setRecipe({ ...recipe, image: file });
  };

  const addRecipe = async () => {
    const formData = new FormData();
    formData.append("name", recipe.name);
    formData.append("instructions", recipe.instructions);
    if (recipe.image) {
      formData.append("image", recipe.image);
    }

    try {
      const response = await fetch("/api/addRecipe", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setSuccessMessage("Recipe added successfully!");
        setRecipe({ name: "", instructions: "", image: null }); // Reset form
        onRecipeAdded(); // Notify parent to refresh recipes
      } else {
        if (response.status === 401) {
          navigate("/login");
        }
        throw new Error("Failed to add recipe");
      }
    } catch (error) {
      console.error(error);
      setSuccessMessage("Error adding recipe");
    }
  };

  return (
    <div className="addrecipe-container">
      <h2 className="addrecipe-component-title">Add a New Recipe</h2>

      {/* Recipe Name Input */}
      <div>
        <input
          type="text"
          name="name"
          value={recipe.name}
          onChange={handleInputChange}
          placeholder="Recipe Name"
        />
      </div>

      {/* Rich Text Editor for Instructions */}
      <div>
        <Editor
          apiKey={TINYMCE_APIKEY}
          tinymceScriptSrc={`/tinymceCdn/1/${TINYMCE_APIKEY}/tinymce/6/tinymce.min.js`} //"/tinymceCdn"
          value={recipe.instructions}
          init={{
            height: 500,
            menubar: false,
            plugins: "link image code",
            inline: false,
            toolbar:
              "undo redo | formatselect | bold italic | alignleft aligncenter alignright | code",
          }}
          onEditorChange={handleEditorChange}
        />
      </div>

      {/* File Upload Input */}
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>

      {/* Submit Button */}
      <div>
        <button className="addrecipe-button" onClick={addRecipe}>Add Recipe</button>
      </div>

      {/* Success Message */}
      {successMessage && <div className="addrecipe-success-message">{successMessage}</div>}
    </div>
  );
}

AddRecipe.propTypes = {
    onRecipeAdded: PropTypes.func.isRequired,
};
  
export default AddRecipe;
