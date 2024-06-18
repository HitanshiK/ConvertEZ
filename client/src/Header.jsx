// Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header className="bg-slate-500 p-4 flex items-center">
      <img
        className="h-10 mr-2"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtXlGMAzbOlwaYJIKyL8foW7d34aAmztU7_w&usqp=CAU"
        alt="ConvertEZ Logo"
      />
      <h1 className="text-white text-2xl">ConvertEZ</h1>
    </header>
  );
};

export default Header;
