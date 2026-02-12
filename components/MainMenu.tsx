
import React from 'react';
import type { ScheduleType, Conflict } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { AlertIcon } from './icons/AlertIcon';
import { DataManagementIcon } from './icons/DataManagementIcon';
import { ResetIcon } from './icons/ResetIcon'; // New icon

interface MainMenuProps {
  onSelect: (schedule: ScheduleType) => void;
  conflicts: Conflict[];
  onResetAllData: () => void; // New prop for reset functionality
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelect, conflicts, onResetAllData }) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">
        Selamat Datang
      </h2>
      <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
        Silakan pilih jenjang pendidikan untuk melihat atau mengelola data jadwal pelajaran.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <MenuCard
          title="Jadwal Pelajaran MTs"
          description="Lihat & edit jadwal untuk Madrasah Tsanawiyah"
          onClick={() => onSelect('MTs')}
          Icon={CalendarIcon}
        />
        <MenuCard
          title="Jadwal Pelajaran MA"
          description="Lihat & edit jadwal untuk Madrasah Aliyah"
          onClick={() => onSelect('MA')}
          Icon={CalendarIcon}
        />
        <MenuCard
          title="Kelola Data Penugasan MTs"
          description="Atur data penugasan guru untuk jenjang MTs"
          onClick={() => onSelect('DataManagementMts')}
          Icon={DataManagementIcon}
        />
        <MenuCard
          title="Kelola Data Penugasan MA"
          description="Atur data penugasan guru untuk jenjang MA"
          onClick={() => onSelect('DataManagementMa')}
          Icon={DataManagementIcon}
        />
        <MenuCard
          title="Reset Semua Data"
          description="Hapus semua jadwal & data penugasan guru"
          onClick={onResetAllData}
          Icon={ResetIcon}
          colorClass="border-red-500 hover:border-red-600 bg-red-50 hover:bg-red-100 text-red-600"
          iconBgClass="bg-red-100 text-red-600 group-hover:bg-red-200"
        />
      </div>
      
      {conflicts.length > 0 && <ConflictSummary conflicts={conflicts} />}

    </div>
  );
};

interface MenuCardProps {
    title: string;
    description: string;
    onClick: () => void;
    Icon: React.ElementType;
    colorClass?: string; // Optional prop for custom card color
    iconBgClass?: string; // Optional prop for custom icon background color
}

const MenuCard: React.FC<MenuCardProps> = ({ title, description, onClick, Icon, colorClass = "border-primary-500 hover:border-primary-600", iconBgClass = "bg-primary-100 text-primary-600 group-hover:bg-primary-200" }) => {
    return (
        <div 
            onClick={onClick}
            className={`group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-t-4 ${colorClass} transform hover:-translate-y-2 flex flex-col items-center`}
        >
            <div className={`mx-auto rounded-full h-16 w-16 flex items-center justify-center mb-4 transition-colors flex-shrink-0 ${iconBgClass}`}>
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">{title}</h3>
            <p className="text-slate-500 text-sm text-center">{description}</p>
        </div>
    )
}

const ConflictSummary: React.FC<{ conflicts: Conflict[] }> = ({ conflicts }) => {
    return (
        <div className="mt-16 max-w-4xl mx-auto bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
                <AlertIcon className="h-6 w-6 mr-3 text-red-600" />
                <h3 className="text-xl font-bold text-red-800">Ringkasan Konflik Jadwal Guru</h3>
            </div>
            <ul className="space-y-3 text-left">
                {conflicts.map((conflict, index) => (
                    <li key={index} className="p-3 bg-red-100 rounded-md text-sm">
                        <p className="font-semibold text-red-900">
                            <span className="font-bold">{conflict.teacher}</span> bentrok pada <span className="font-bold">{conflict.day}</span>, jam <span className="font-bold">{conflict.time}</span>
                        </p>
                        <ul className="list-disc list-inside mt-1 pl-2 text-red-800">
                            {conflict.details.map((detail, detailIndex) => (
                                <li key={detailIndex}>
                                    <span className="font-semibold">{detail.school}:</span> {detail.subject} ({detail.class})
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    )
}


export default MainMenu;