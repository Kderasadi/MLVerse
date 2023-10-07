import React, { useState } from "react";

function DropdownMenu({ selectedLanguage, setSelectedLanguage }) {
  // State to manage the visibility of the dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to toggle the dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const languageOptions = ["Spanish", "French", "German"];

  // Function to handle language selection
  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const style = {
    dropdown: {
      fontSize: "18px",
      fontWeight: "500",
      color: "#444444",
    },
  };

  return (
    <div style={style.dropdown}>
      {/* Dropdown label */}
      <label htmlFor="languageDropdown">Select Language: </label>

      {/* Dropdown select input */}
      <select
        id="languageDropdown"
        value={selectedLanguage}
        onChange={handleLanguageChange}
      >
        <option value="English">English</option>

        {/* Map options from the languageOptions array */}
        {languageOptions.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DropdownMenu;
