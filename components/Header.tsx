
import React from 'react';
import { SchoolIcon } from './icons/SchoolIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <SchoolIcon className="h-8 w-8 mr-3"/>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Jadwal Pelajaran Digital
        </h1>
      </div>
    </header>
  );
};

export default Header;
