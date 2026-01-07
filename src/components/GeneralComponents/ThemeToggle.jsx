import { BsSun, BsMoon } from "react-icons/bs";

const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <div className="dark-btn-option" style={{ display: "flex", gap: "10px" }}>
      {isDarkMode && <div
        className={`theme-option active d-flex align-items-center justify-content-center `}
        style={{ cursor: "pointer", }}
        onClick={(e) => {
          e.stopPropagation();
          setIsDarkMode(false);
        }}
      >
        <BsSun size={16} />
      </div>}

      {!isDarkMode && <div
        className={`theme-option d-flex align-items-center justify-content-center `}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          setIsDarkMode(true);
        }}
      >
        <BsMoon size={16} />
      </div>}
    </div>
  );
};

export default ThemeToggle;
