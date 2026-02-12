
import React, { useState } from 'react';
import type { ScheduleByClass, Teacher, Subject, ScheduleByClassItem, TeachingAssignment } from '../types';
import { BackArrowIcon } from './icons/BackArrowIcon';
import { AlertIcon } from './icons/AlertIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ScheduleViewProps {
  scheduleType: 'MTs' | 'MA';
  title: string;
  scheduleData: ScheduleByClass;
  classLevels: [string, string, string];
  onBack: () => void;
  interScheduleConflicts: Set<string>;
  subjects: Subject[];
  teachingAssignments: TeachingAssignment[];
  onScheduleUpdate: (
    scheduleType: 'MTs' | 'MA',
    day: string,
    time: string, // This will be the oldTime when editing, or current time for other fields
    classKey: 'A' | 'B' | 'C',
    field: 'subject' | 'teacher' | 'time', // Updated field type
    value: string
  ) => void;
  onAddDay: (scheduleType: 'MTs' | 'MA') => void; // New prop
  onDeleteDay: (scheduleType: 'MTs' | 'MA', day: string) => void; // New prop
  onAddRow: (scheduleType: 'MTs' | 'MA', day: string) => void; // New prop
  onDeleteRow: (scheduleType: 'MTs' | 'MA', day: string, time: string) => void; // New prop
}

type EditingCell = {
  day: string;
  time: string;
  classKey: 'A' | 'B' | 'C';
  field: 'subject' | 'teacher';
} | null;

type EditingTimeCell = {
  day: string;
  time: string; // This is the original time to identify the cell
} | null;

const ScheduleView: React.FC<ScheduleViewProps> = ({ scheduleType, title, scheduleData, classLevels, onBack, interScheduleConflicts, subjects, teachingAssignments, onScheduleUpdate, onAddDay, onDeleteDay, onAddRow, onDeleteRow }) => {
  const days = Object.keys(scheduleData);
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editingTimeCell, setEditingTimeCell] = useState<EditingTimeCell>(null);


  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editingCell) {
      onScheduleUpdate(scheduleType, editingCell.day, editingCell.time, editingCell.classKey, editingCell.field, e.target.value);
      setEditingCell(null); // Exit editing mode after selection
    }
  };

  const renderEditableCell = (
    item: ScheduleByClassItem,
    day: string,
    classKey: 'A' | 'B' | 'C',
    field: 'subject' | 'teacher'
  ) => {
    const currentValue = field === 'subject' ? item[`class${classKey}`] : item[`teacher${classKey}`];
    const isConflict = field === 'teacher' && interScheduleConflicts.has(`${day}-${item.time}-${currentValue}`);

    const cellIdentifier = { day, time: item.time, classKey, field };
    const isEditing = editingCell && JSON.stringify(editingCell) === JSON.stringify(cellIdentifier);
    const isBreak = field === 'subject' && currentValue.toUpperCase().includes('ISTIRAHAT');
    const tooltip = isConflict ? "Guru memiliki jadwal bentrok di jenjang lain." : undefined;

    let cellClass = `px-4 py-4 border border-gray-200 text-center`;
    if (field === 'teacher') cellClass += ' text-xs text-gray-500';
    if(isConflict) cellClass += ` bg-red-100 text-red-800 font-bold`;
    if(isBreak) cellClass += ` text-teal-800 font-semibold`;
    // Apply clickable styles to all subject cells when not editing, including breaks
    if(!isEditing && field === 'subject') cellClass += ` cursor-pointer hover:bg-yellow-100`; 

    if (isEditing && field === 'subject') { // Only allow editing for subject field
      let options: Subject[] = subjects;

      return (
        <td className={cellClass}>
          <select
            value={currentValue}
            onChange={handleSelectChange}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => { // Allow Escape key to cancel editing without saving
                if (e.key === 'Escape') {
                    setEditingCell(null);
                }
            }}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white text-black"
            autoFocus
          >
            {options.map(option => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </td>
      );
    }
    
    // For teacher fields, or non-editing subject fields
    return (
      <td 
        className={cellClass} 
        title={tooltip} 
        // Allow all subject cells to be clicked, regardless of `isBreak` status
        onClick={() => field === 'subject' && setEditingCell(cellIdentifier)} 
      >
          <div className="flex items-center justify-center gap-2">
            {isConflict && <AlertIcon className="h-4 w-4 text-red-600" />}
            <span>{currentValue}</span>
          </div>
      </td>
    );
  };


  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors duration-200"
        >
          <BackArrowIcon className="h-5 w-5 mr-2" />
          Kembali ke Menu
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-right text-slate-800">{title}</h2>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => onAddDay(scheduleType)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Hari
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600 border-collapse">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" rowSpan={2} className="px-4 py-3 font-bold border border-gray-200 w-28 align-middle">Hari</th>
              <th scope="col" rowSpan={2} className="px-4 py-3 font-bold border border-gray-200 text-center w-32 align-middle">Jam</th>
              <th scope="col" colSpan={2} className="px-4 py-3 font-bold border border-gray-200 text-center">{classLevels[0]}</th>
              <th scope="col" colSpan={2} className="px-4 py-3 font-bold border border-gray-200 text-center">{classLevels[1]}</th>
              <th scope="col" colSpan={2} className="px-4 py-3 font-bold border border-gray-200 text-center">{classLevels[2]}</th>
              <th scope="col" rowSpan={2} className="px-2 py-3 font-bold border border-gray-200 text-center w-16 align-middle">Aksi Baris</th>
            </tr>
            <tr>
                <th scope="col" className="px-4 py-3 font-semibold border border-gray-200 text-center">Jadwal</th>
                <th scope="col" className="px-2 py-3 font-semibold border border-gray-200 text-center">Kode Guru</th>
                <th scope="col" className="px-4 py-3 font-semibold border border-gray-200 text-center">Jadwal</th>
                <th scope="col" className="px-2 py-3 font-semibold border border-gray-200 text-center">Kode Guru</th>
                <th scope="col" className="px-4 py-3 font-semibold border border-gray-200 text-center">Jadwal</th>
                <th scope="col" className="px-2 py-3 font-semibold border border-gray-200 text-center">Kode Guru</th>
            </tr>
          </thead>
          <tbody>
            {days.length === 0 ? (
                <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500 text-lg">
                        Tidak ada jadwal tersedia. Silakan <button onClick={() => onAddDay(scheduleType)} className="text-primary-600 hover:underline">Tambah Hari</button> pertama Anda!
                    </td>
                </tr>
            ) : (days.map((day) => {
              const daySchedule = scheduleData[day] || [];
              
              return (
                <React.Fragment key={day}>
                  {daySchedule.map((item, itemIndex) => {
                    const isBreak = item.classA.toUpperCase().includes('ISTIRAHAT');
                    const rowClass = isBreak ? 'bg-teal-50' : (itemIndex % 2 !== 0 ? 'bg-slate-50' : 'bg-white');

                    return (
                      <tr key={`${day}-${item.time}`} className={`border-b ${rowClass}`}>
                        {itemIndex === 0 && (
                          <th rowSpan={daySchedule.length} className="px-4 py-4 font-bold text-gray-900 border border-gray-200 align-top bg-slate-50" scope="row">
                            <div className="flex items-center justify-between gap-2">
                                <span>{day}</span>
                                <button onClick={() => onDeleteDay(scheduleType, day)} className="text-red-600 hover:text-red-800 p-1">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                          </th>
                        )}
                        {/* Editable time slot */}
                        <td
                          className="px-4 py-4 border border-gray-200 text-center font-medium text-gray-800 cursor-pointer hover:bg-yellow-100"
                          onClick={() => {
                            setEditingTimeCell({ day, time: item.time });
                            setEditingCell(null); // Ensure subject editing is off
                          }}
                        >
                          {editingTimeCell?.day === day && editingTimeCell?.time === item.time ? (
                            <input
                              type="text"
                              value={item.time} // Display current time from state
                              onChange={(e) => {
                                // For immediate visual feedback, a local state for input value could be used here.
                                // However, `onScheduleUpdate` will trigger a full re-render, so direct call is fine.
                              }}
                              onBlur={(e) => {
                                onScheduleUpdate(scheduleType, day, item.time, 'A', 'time', e.target.value);
                                setEditingTimeCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur(); // Trigger onBlur to save
                                } else if (e.key === 'Escape') {
                                  setEditingTimeCell(null); // Cancel editing without saving
                                }
                              }}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white text-black text-center"
                              autoFocus
                            />
                          ) : (
                            <span>{item.time}</span>
                          )}
                        </td>
                        
                        {renderEditableCell(item, day, 'A', 'subject')}
                        {renderEditableCell(item, day, 'A', 'teacher')}
                        
                        {renderEditableCell(item, day, 'B', 'subject')}
                        {renderEditableCell(item, day, 'B', 'teacher')}

                        {renderEditableCell(item, day, 'C', 'subject')}
                        {renderEditableCell(item, day, 'C', 'teacher')}

                        <td className="px-2 py-4 border border-gray-200 text-center">
                            <button onClick={() => onDeleteRow(scheduleType, day, item.time)} className="text-red-600 hover:text-red-800 p-1">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr key={`${day}-add-row`} className="bg-gray-50">
                    <td colSpan={9} className="px-4 py-2 text-center border border-gray-200">
                        <button
                            onClick={() => onAddRow(scheduleType, day)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-200"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Tambah Baris
                        </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            }))}
          </tbody>
        </table>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ScheduleView;