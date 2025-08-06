import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FilterButton.css';

const FilterButton = ({ 
  children, 
  isActive = false, 
  onClick, 
  variant = 'default' 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (variant === 'action' && children === '게시물 작성') {
      navigate('/board/write');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button 
      className={`filter-button ${isActive ? 'active' : ''} ${variant}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default FilterButton;