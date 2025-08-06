import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ 
  categories, 
  activeCategory = '전체', 
  onCategoryChange 
}) => {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-filter-button ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;