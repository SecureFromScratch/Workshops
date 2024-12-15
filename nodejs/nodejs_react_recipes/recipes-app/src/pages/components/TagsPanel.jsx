import React, { useState } from "react";
import PropTypes from "prop-types";
import "./TagsPanel.css?no-inline";

function TagsPanel({ recipeId, initialTags, initialMyVotes }) {
    const [tags, setTags] = useState({ ...initialTags });
    const [myVotes, setMyVotes] = useState({ ...initialMyVotes });
    const [activeTag, setActiveTag] = useState(null); // Track the active tag
    const [focusedPopup, setFocusedPopup] = useState(false);
    const [newTag, setNewTag] = useState("");

    const handleVotes = async (votes) => {
      console.log(`RecipeId: ${recipeId} Votes: ${votes}`);

      const now = new Date();
      const formattedDate = `${now.getFullYear()}/${
        String(now.getMonth() + 1).padStart(2, '0')}/${
        String(now.getDate()).padStart(2, '0')} ${
        String(now.getHours()).padStart(2, '0')}:${
        String(now.getMinutes()).padStart(2, '0')}:${
        String(now.getSeconds()).padStart(2, '0')}`;      
      
      votes = Object.fromEntries(
        Object.entries(votes).map(([tag, direction]) => [tag, { direction, atLocalTime: formattedDate }])
      );

      try {
        const response = await fetch("/api/tagVote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId, votes }),
        });
  
        if (response.ok) {
          const updatedTags = await response.json();
          setTags(updatedTags.tags);
          setMyVotes(updatedTags.myVotes);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    const handleAddTag = async (newTag) => {
      if (newTag.trim()) {
        await handleVotes({ [newTag]: 1 });
        console.log(`New tag added: ${newTag}`);
      }
    };

    const onClickNewTagAdd = async() => {
      const newTagName = newTag.trim();
      if (newTagName) {
        setFocusedPopup(false); // Close the popup
        setActiveTag(null);
        setNewTag("");
        await handleAddTag(newTagName);
      }
    };

    const handleVoteForAll = async (direction) => {
      const votes = Object.fromEntries(
        Object.keys(tags).map(tag => [tag, direction])
      );
      await handleVotes(votes);
      console.log(`All votes changed: ${direction}`);
    };
  
    return (
      <div className="tags-panel">
        {/* New Tag */}
        <div
          className="tag-item new-tag-item"
          onMouseEnter={() => setActiveTag("new-tag")}
          onMouseLeave={() => !focusedPopup && setActiveTag(null)}
        >
          <span>New Tag</span>
          {(activeTag === "new-tag" || focusedPopup) && (
            <div
              className="new-tag-panel"
              onMouseEnter={() => setFocusedPopup(true)}
              onMouseLeave={() => setFocusedPopup(false)}
            >
              <input
                type="text"
                placeholder="Enter tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onFocus={() => setFocusedPopup(true)} // Keep the popup visible
                onBlur={() => setFocusedPopup(false)}
              />
              <button onClick={onClickNewTagAdd}>Add</button>
            </div>
          )}
        </div>
  
        {/* All Tags */}
        <div
          className="tag-item all-tag-item"
          onMouseEnter={() => setActiveTag("all")}
          onMouseLeave={() => setActiveTag(null)}
        >
          <span>All</span>
          {activeTag === "all" && (
            <div className="vote-popup">
              <span onClick={() => handleVoteForAll(1)}>👍</span>
              <span onClick={() => handleVoteForAll(-1)}>👎</span>
            </div>
          )}
        </div>

        {/* Existing Tags */}
        {Object.entries(tags).map(([tag, votes]) => (
          <div
            key={tag}
            className="tag-item"
            onMouseEnter={() => setActiveTag(tag)}
            onMouseLeave={() => setActiveTag(null)}
          >
            <span>{tag} ({votes})</span>
            {myVotes[tag] && (
              <span
                className={`vote-indicator ${myVotes[tag].direction === 1 ? "thumbs-up" : "thumbs-down"}`}
              >
                {myVotes[tag].direction === 1 ? "👍" : "👎"}
              </span>
            )}
            {activeTag === tag && (
              <div className="vote-popup">
                <span onClick={() => handleVotes({ [tag]: 1 })}>👍</span>
                <span onClick={() => handleVotes({ [tag]: -1 })}>👎</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
}

TagsPanel.propTypes = {
    initialTags: PropTypes.objectOf(PropTypes.number),
    initialMyVotes: PropTypes.objectOf(PropTypes.object),
    recipeId: PropTypes.string.isRequired,
};

export default TagsPanel;
