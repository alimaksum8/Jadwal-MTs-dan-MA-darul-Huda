
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-200 text-slate-600">
      <div className="container mx-auto py-4 px-4 text-center">
        <p>&copy; {currentYear} Sistem Informasi Sekolah. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
