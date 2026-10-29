import React from 'react';
import { Link } from 'react-router-dom';

const Hashtag = ({ tag, className = '' }) => {
  const clean = String(tag).replace(/^#/, '');
  return (
    <Link
      to={`/search?hashtag=${encodeURIComponent(clean.toLowerCase())}`}
      className={`hashtag text-sm md:text-[0.9rem] no-underline ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      #{clean}
    </Link>
  );
};

export default Hashtag;