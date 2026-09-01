import { CATEGORIES } from "../../constants/categories.js";

const FILTER_OPTIONS = ["All", ...CATEGORIES];

function FilterBar({ activeCategory, onSelectCategory }) {
  return (
    <div className="filter-bar">
      {FILTER_OPTIONS.map((cat) => (
        <button
          key={cat}
          className={`filter-btn${activeCategory === cat ? " filter-btn--active" : ""}`}
          onClick={() => onSelectCategory(cat === "All" ? "" : cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
