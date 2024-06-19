// Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-slate-500 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <img
          className="h-10 mr-2"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtXlGMAzbOlwaYJIKyL8foW7d34aAmztU7_w&usqp=CAU"
          alt="ConvertEZ Logo"
        />
        <h1 className="text-white text-2xl">ConvertEZ</h1>
      </div>
      <nav className="flex space-x-4">
        <Link to="/merge" className="text-white text-lg hover:text-gray-300">Merge PDF</Link>
        <Link to="/split" className="text-white text-lg hover:text-gray-300">Split PDF</Link>
        <Link to="/compress" className="text-white text-lg hover:text-gray-300">Compress PDF</Link>
      </nav>
    </header>
  );
};

export default Header;
