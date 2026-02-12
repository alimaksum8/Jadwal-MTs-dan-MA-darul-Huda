
import React, { useMemo } from 'react';
import { BackArrowIcon } from './icons/BackArrowIcon';
import type { ScheduleByClass } from '../types';

interface DatabaseViewProps {
  onBack: () => void;
  mtsSchedule: ScheduleByClass;
  maSchedule: ScheduleByClass;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ onBack, mtsSchedule, maSchedule }) => {
  const { teachers, subjects } = useMemo(() => {
    const teacherMap = new Map<string, Set<string>>();
    const subjectMap = new Map<string, Set<string>>();

    const ignoredTeachers = ["-", "OSIS", "WALI", "PEMBINA"];
    const ignoredSubjects = [
      "ISTIRAHAT",
      "ISTIRAHAT & SHOLAT",
      "UPACARA BENDERA",
      "JUM'AT BERSIH & IMTAQ",
      "PRAMUKA",
      "EKSKUL WAJIB"
    ];

    const processSchedule = (schedule: ScheduleByClass, school: 'MTs' | 'MA') => {
      Object.values(schedule).flat().forEach(item => {
        const scheduleItems = [
          { teacher: item.teacherA, subject: item.classA },
          { teacher: item.teacherB, subject: item.classB },
          { teacher: item.teacherC, subject: item.classC },
        ];

        scheduleItems.forEach(({ teacher, subject }) => {
          // Process teachers
          if (teacher && !ignoredTeachers.includes(teacher)) {
            if (!teacherMap.has(teacher)) {
              teacherMap.set(teacher, new Set());
            }
            teacherMap.get(teacher)!.add(school);
          }
          
          // Process subjects
          if (subject && !ignoredSubjects.some(ignored => subject.toUpperCase().includes(ignored))) {
            if (!subjectMap.has(subject)) {
              subjectMap.set(subject, new Set());
            }
            subjectMap.get(subject)!.add(school);
          }
        });
      });
    };

    processSchedule(mtsSchedule, 'MTs');
    processSchedule(maSchedule, 'MA');

    const teachers = Array.from(teacherMap.entries()).map(([code, schools]) => ({
      code,
      schools: Array.from(schools).join(', ')
    })).sort((a, b) => a.code.localeCompare(b.code, undefined, {numeric: true}));

    const subjects = Array.from(subjectMap.entries()).map(([name, schools]) => ({
      name,
      schools: Array.from(schools).join(', ')
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    return { teachers, subjects };
  }, [mtsSchedule, maSchedule]);

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
        <h2 className="text-2xl sm:text-3xl font-bold text-right text-slate-800">Database Jadwal</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-slate-700 mb-3">Database Guru</h3>
          <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm max-h-[60vh]">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">Kode Guru</th>
                  <th scope="col" className="px-6 py-3">Mengajar di</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(({ code, schools }, index) => (
                  <tr key={code} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{code}</th>
                    <td className="px-6 py-4">{schools}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-slate-700 mb-3">Database Mata Pelajaran</h3>
           <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm max-h-[60vh]">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">Nama Mata Pelajaran</th>
                  <th scope="col" className="px-6 py-3">Jenjang</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(({ name, schools }, index) => (
                  <tr key={name} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{name}</th>
                    <td className="px-6 py-4">{schools}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DatabaseView;
