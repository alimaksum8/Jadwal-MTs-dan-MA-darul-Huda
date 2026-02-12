
import React from 'react';
import type { ScheduleType, Conflict } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { AlertIcon } from './icons/AlertIcon';
import { DataManagementIcon } from './icons/DataManagementIcon';
import { ResetIcon } from './icons/ResetIcon';
import { SchoolIcon } from './icons/SchoolIcon';

interface MainMenuProps {
  onSelect: (schedule: ScheduleType) => void;
  conflicts: Conflict[];
  onResetAllData: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelect, conflicts, onResetAllData }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-2xl mb-2">
          <SchoolIcon className="h-10 w-10 text-primary-600" />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Portal Jadwal Pelajaran
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Sistem Informasi Akademik Digital untuk pengelolaan jadwal terpadu. 
          Pilih jenjang pendidikan di bawah ini.
        </p>
      </div>

      {/* Primary Section: MTs & MA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* MTs Card */}
        <div 
          onClick={() => onSelect('MTs')}
          className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100 hover:-translate-y-2"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-110"></div>
          <div className="p-8 flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="p-5 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 text-white transform group-hover:rotate-6 transition-transform">
              <CalendarIcon className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Jadwal MTs</h3>
              <p className="text-slate-500">Madrasah Tsanawiyah (Kelas 7, 8, 9)</p>
            </div>
            <span className="inline-flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform">
              Buka Jadwal <span className="ml-2">→</span>
            </span>
          </div>
        </div>

        {/* MA Card */}
        <div 
          onClick={() => onSelect('MA')}
          className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100 hover:-translate-y-2"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-50 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-110"></div>
          <div className="p-8 flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="p-5 bg-secondary-600 rounded-2xl shadow-lg shadow-secondary-200 text-white transform group-hover:-rotate-6 transition-transform">
              <CalendarIcon className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Jadwal MA</h3>
              <p className="text-slate-500">Madrasah Aliyah (Kelas 10, 11, 12)</p>
            </div>
            <span className="inline-flex items-center text-secondary-600 font-semibold group-hover:translate-x-2 transition-transform">
              Buka Jadwal <span className="ml-2">→</span>
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Section: Management Tools */}
      <div className="bg-slate-50 rounded-[2.5rem] p-10 mt-12 border border-slate-200 shadow-inner">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Pengaturan & Manajemen Data</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ManagementItem 
            title="Penugasan MTs"
            onClick={() => onSelect('DataManagementMts')}
            icon={<DataManagementIcon className="h-6 w-6" />}
            color="text-primary-600"
            bg="bg-primary-100"
          />
          <ManagementItem 
            title="Penugasan MA"
            onClick={() => onSelect('DataManagementMa')}
            icon={<DataManagementIcon className="h-6 w-6" />}
            color="text-secondary-600"
            bg="bg-secondary-100"
          />
          <ManagementItem 
            title="Reset Sistem"
            onClick={onResetAllData}
            icon={<ResetIcon className="h-6 w-6" />}
            color="text-red-600"
            bg="bg-red-100"
          />
        </div>
      </div>
      
      {conflicts.length > 0 && <ConflictSummary conflicts={conflicts} />}
    </div>
  );
};

const ManagementItem: React.FC<{ title: string; onClick: () => void; icon: React.ReactNode; color: string; bg: string }> = ({ title, onClick, icon, color, bg }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
  >
    <div className={`p-3 ${bg} ${color} rounded-xl group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="font-bold text-slate-700">{title}</span>
  </button>
);

const ConflictSummary: React.FC<{ conflicts: Conflict[] }> = ({ conflicts }) => {
    return (
        <div className="mt-8 max-w-4xl mx-auto bg-red-50 border-l-8 border-red-500 text-red-700 p-8 rounded-3xl shadow-lg animate-pulse-subtle">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-red-500 rounded-full mr-4 text-white">
                  <AlertIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-900">Deteksi Konflik Jadwal</h3>
                  <p className="text-red-700">Terdapat guru yang mengajar di waktu bersamaan.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {conflicts.map((conflict, index) => (
                    <div key={index} className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-red-200 shadow-sm text-sm">
                        <p className="font-bold text-red-900 mb-2">
                            {conflict.teacher} • <span className="font-normal opacity-75">{conflict.day}, {conflict.time}</span>
                        </p>
                        <div className="flex flex-col gap-1">
                            {conflict.details.map((detail, detailIndex) => (
                                <div key={detailIndex} className="flex justify-between items-center px-2 py-1 bg-red-100/50 rounded-lg">
                                    <span className="font-semibold text-red-800">{detail.school}</span>
                                    <span className="text-red-600">{detail.class}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
              @keyframes pulse-subtle {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.005); }
              }
              .animate-pulse-subtle { animation: pulse-subtle 4s infinite ease-in-out; }
            `}</style>
        </div>
    )
}

export default MainMenu;
