
import React, { useState, useMemo, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import ScheduleView from './components/ScheduleView';
import Header from './components/Header';
import Footer from './components/Footer';
import DataManagementView from './components/DataManagementView';
import { MTS_SCHEDULE_BY_CLASS, MA_SCHEDULE_BY_CLASS, EMPTY_SCHEDULE_ROW } from './constants/scheduleData';
import type { ScheduleType, ScheduleByClass, Conflict, ConflictDetail, Teacher, Subject, TeachingAssignment, ScheduleByClassItem } from './types';

const ignoredSubjects = [
  "ISTIRAHAT",
  "ISTIRAHAT & SHOLAT",
  "UPACARA BENDERA",
  "JUM'AT BERSIH & IMTAQ",
  "PRAMUKA",
  "EKSKUL WAJIB",
  "BIMBINGAN KONSELING"
];
const ignoredTeachers = ["-", "OSIS", "WALI", "PEMBINA"];

const calculateConflicts = (mtsSchedule: ScheduleByClass, maSchedule: ScheduleByClass, ignoredTeachers: string[]) => {
  const teacherScheduleMap = new Map<string, ConflictDetail[]>();

  const processSchedule = (schedule: ScheduleByClass, schoolType: 'MTs' | 'MA', classLevels: string[]) => {
    Object.keys(schedule).forEach(day => {
      (schedule[day] || []).forEach(item => {
        [
          { code: item.teacherA, subject: item.classA, class: classLevels[0] },
          { code: item.teacherB, subject: item.classB, class: classLevels[1] },
          { code: item.teacherC, subject: item.classC, class: classLevels[2] }
        ].forEach(({ code, subject, class: className }) => {
          if (!code || ignoredTeachers.includes(code)) return;
          const key = `${day}-${item.time}-${code}`;
          teacherScheduleMap.set(key, [...(teacherScheduleMap.get(key) || []), { school: schoolType, subject, class: className }]);
        });
      });
    });
  };

  processSchedule(mtsSchedule, 'MTs', ['Kelas 7', 'Kelas 8', 'Kelas 9']);
  processSchedule(maSchedule, 'MA', ['Kelas 10', 'Kelas 11', 'Kelas 12']);
  
  return Array.from(teacherScheduleMap.entries()).reduce((acc, [key, details]) => {
    if (details.length > 1) {
      const [day, time, teacher] = key.split('-');
      acc.detailedConflicts.push({ day, time, teacher, details });
      acc.conflictSetForView.add(key);
    }
    return acc;
  }, { detailedConflicts: [] as Conflict[], conflictSetForView: new Set<string>() });
};


const App: React.FC = () => {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);
  const [teachingAssignments, setTeachingAssignments] = useState<TeachingAssignment[]>([]);
  const [mtsSchedule, setMtsSchedule] = useState<ScheduleByClass>({});
  const [maSchedule, setMaSchedule] = useState<ScheduleByClass>({});
  const [showConflictNotification, setShowConflictNotification] = useState(false);
  const [conflictNotificationMessage, setConflictNotificationMessage] = useState('');
  const [showAppNotification, setShowAppNotification] = useState(false);
  const [appNotificationMessage, setAppNotificationMessage] = useState('');
  const [appNotificationType, setAppNotificationType] = useState<'success' | 'error' | 'info'>('info');


  useEffect(() => {
    const savedAssignments = localStorage.getItem('teachingAssignments');
    if (savedAssignments && JSON.parse(savedAssignments).length > 0) {
      setTeachingAssignments(JSON.parse(savedAssignments));
    } else {
      const assignmentMap = new Map<string, Omit<TeachingAssignment, 'id' | 'teacherName'>>();
      const teacherNameMap = new Map<string, string>();
      

      const processScheduleForInit = (schedule: ScheduleByClass, school: 'Mts' | 'Ma') => {
        Object.values(schedule).flat().forEach(item => {
          [
            { teacher: item.teacherA, subject: item.classA },
            { teacher: item.teacherB, subject: item.classB },
            { teacher: item.teacherC, subject: item.teacherC },
          ].forEach(({ teacher, subject }) => {
            if (!teacher || ignoredTeachers.includes(teacher) || !subject || ignoredSubjects.some(ignored => subject.toUpperCase().includes(ignored))) {
              return;
            }
            const key = `${teacher}-${subject}`;
            if (!assignmentMap.has(key)) {
              assignmentMap.set(key, {
                teacherCode: teacher,
                subjectName: subject,
                teachesInMts: false,
                teachesInMa: false,
              });
            }
            if (!teacherNameMap.has(teacher)) {
              teacherNameMap.set(teacher, `Guru ${teacher}`);
            }
            const assignment = assignmentMap.get(key)!;
            if (school === 'Mts') assignment.teachesInMts = true;
            if (school === 'Ma') assignment.teachesInMa = true;
          });
        });
      };
      
      if (!savedAssignments) {
        processScheduleForInit(MTS_SCHEDULE_BY_CLASS, 'Mts');
        processScheduleForInit(MA_SCHEDULE_BY_CLASS, 'Ma');
        const initialAssignments: TeachingAssignment[] = Array.from(assignmentMap.values()).map(assignment => ({
          ...assignment,
          id: self.crypto.randomUUID(),
          teacherName: teacherNameMap.get(assignment.teacherCode) || 'Nama Guru',
        })).sort((a,b) => a.teacherCode.localeCompare(b.teacherCode, undefined, {numeric: true}) || a.subjectName.localeCompare(b.subjectName));
        setTeachingAssignments(initialAssignments);
        localStorage.setItem('teachingAssignments', JSON.stringify(initialAssignments));
      } else if (JSON.parse(savedAssignments).length === 0) {
        setTeachingAssignments([]);
        localStorage.setItem('teachingAssignments', JSON.stringify([]));
      }
    }

    const savedMtsSchedule = localStorage.getItem('mtsSchedule');
    setMtsSchedule(savedMtsSchedule && Object.keys(JSON.parse(savedMtsSchedule)).length > 0 ? JSON.parse(savedMtsSchedule) : MTS_SCHEDULE_BY_CLASS);

    const savedMaSchedule = localStorage.getItem('maSchedule');
    setMaSchedule(savedMaSchedule && Object.keys(JSON.parse(savedMaSchedule)).length > 0 ? JSON.parse(savedMaSchedule) : MA_SCHEDULE_BY_CLASS);

  }, []);

  useEffect(() => {
    if (showAppNotification) {
      const timer = setTimeout(() => {
        setShowAppNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAppNotification]);


  const handleAssignmentsUpdate = (newAssignments: TeachingAssignment[]) => {
    setTeachingAssignments(newAssignments);
    localStorage.setItem('teachingAssignments', JSON.stringify(newAssignments));
  };
  
  const updateSchedule = (scheduleType: 'MTs' | 'MA', newSchedule: ScheduleByClass) => {
    if (scheduleType === 'MTs') {
      setMtsSchedule(newSchedule);
      localStorage.setItem('mtsSchedule', JSON.stringify(newSchedule));
    } else {
      setMaSchedule(newSchedule);
      localStorage.setItem('maSchedule', JSON.stringify(newSchedule));
    }
  };

  const handleScheduleUpdate = (scheduleType: 'MTs' | 'MA', day: string, oldTime: string, classKey: 'A' | 'B' | 'C', field: 'subject' | 'teacher' | 'time', value: string) => {
    const isMts = scheduleType === 'MTs';
    const currentSchedule = isMts ? { ...mtsSchedule } : { ...maSchedule };
    const daySchedule = [...(currentSchedule[day] || [])];
    const itemIndex = daySchedule.findIndex(item => item.time === oldTime);

    if (itemIndex !== -1) {
      const itemToUpdate: ScheduleByClassItem = { ...daySchedule[itemIndex] };
      let newTeacherCode = itemToUpdate[`teacher${classKey}`];

      if (field === 'subject') {
        itemToUpdate[`class${classKey}`] = value;
        const newSubjectName = value.trim();
        const isIgnoredSubject = ignoredSubjects.some(ignored => newSubjectName.toUpperCase().includes(ignored.toUpperCase()));

        if (!isIgnoredSubject) {
          const firstMatchingAssignment = teachingAssignments.find(a =>
            a.subjectName.trim() === newSubjectName &&
            (isMts ? a.teachesInMts : a.teachesInMa)
          );
          if (firstMatchingAssignment) {
            newTeacherCode = firstMatchingAssignment.teacherCode;
          } else {
            newTeacherCode = "-";
          }
        } else {
          newTeacherCode = "-";
        }
        itemToUpdate[`teacher${classKey}`] = newTeacherCode;

      } else if (field === 'time') {
        const newTime = value.trim();
        if (newTime === oldTime) return;
        
        if (daySchedule.some((item, idx) => idx !== itemIndex && item.time === newTime)) {
            setAppNotificationMessage(`Slot waktu '${newTime}' sudah ada.`);
            setAppNotificationType('error');
            setShowAppNotification(true);
            return;
        }
        itemToUpdate.time = newTime;
        currentSchedule[day] = [...daySchedule.slice(0, itemIndex), itemToUpdate, ...daySchedule.slice(itemIndex + 1)]
                                .sort((a,b) => a.time.localeCompare(b.time));
        
        updateSchedule(scheduleType, currentSchedule);
        setAppNotificationMessage(`Waktu diubah ke ${newTime}`);
        setAppNotificationType('success');
        setShowAppNotification(true);
        return;
      }
      
      if (newTeacherCode !== '-' && !ignoredTeachers.includes(newTeacherCode)) {
        const hypotheticalSchedule = { ...currentSchedule };
        const hypotheticalDaySchedule = [...daySchedule];
        hypotheticalDaySchedule[itemIndex] = itemToUpdate;
        hypotheticalSchedule[day] = hypotheticalDaySchedule;

        const otherSchedule = isMts ? maSchedule : mtsSchedule;
        const { conflictSetForView: potentialConflictSet } = calculateConflicts(
          isMts ? hypotheticalSchedule : otherSchedule,
          isMts ? otherSchedule : hypotheticalSchedule,
          ignoredTeachers
        );
        
        const keyToCheck = `${day}-${oldTime}-${newTeacherCode}`;
        if (potentialConflictSet.has(keyToCheck)) {
          setConflictNotificationMessage(`BENTROK: Guru ${newTeacherCode} ada jadwal lain!`);
          setShowConflictNotification(true);
          setTimeout(() => setShowConflictNotification(false), 5000);
        } else {
          setShowConflictNotification(false);
        }
      } else {
        setShowConflictNotification(false);
      }

      daySchedule[itemIndex] = itemToUpdate;
      currentSchedule[day] = daySchedule;
      updateSchedule(scheduleType, currentSchedule);
    }
  };

  const handleAddDay = (scheduleType: 'MTs' | 'MA') => {
    const newDayName = prompt('Nama hari baru (contoh: Senin):');
    if (!newDayName) return;
    const normalizedNewDayName = newDayName.trim();
    const currentSchedule = scheduleType === 'MTs' ? { ...mtsSchedule } : { ...maSchedule };
    
    if (Object.keys(currentSchedule).includes(normalizedNewDayName)) {
      setAppNotificationMessage(`Hari ${normalizedNewDayName} sudah ada.`);
      setAppNotificationType('error');
      setShowAppNotification(true);
      return;
    }

    currentSchedule[normalizedNewDayName] = [];
    updateSchedule(scheduleType, currentSchedule);
  };

  const handleDeleteDay = (scheduleType: 'MTs' | 'MA', dayToDelete: string) => {
    if (!window.confirm(`Hapus seluruh jadwal hari ${dayToDelete}?`)) return;
    const currentSchedule = scheduleType === 'MTs' ? { ...mtsSchedule } : { ...maSchedule };
    delete currentSchedule[dayToDelete];
    updateSchedule(scheduleType, currentSchedule);
  };

  const handleAddRow = (scheduleType: 'MTs' | 'MA', day: string) => {
    const newTimeSlot = prompt('Jam baru (contoh: 07:00 - 07:40):');
    if (!newTimeSlot) return;
    const currentSchedule = scheduleType === 'MTs' ? { ...mtsSchedule } : { ...maSchedule };
    const daySchedule = [...(currentSchedule[day] || [])];

    const newRow: ScheduleByClassItem = { time: newTimeSlot.trim(), ...EMPTY_SCHEDULE_ROW };
    currentSchedule[day] = [...daySchedule, newRow].sort((a,b) => a.time.localeCompare(b.time));
    updateSchedule(scheduleType, currentSchedule);
  };

  const handleDeleteRow = (scheduleType: 'MTs' | 'MA', day: string, timeToDelete: string) => {
    const currentSchedule = scheduleType === 'MTs' ? { ...mtsSchedule } : { ...maSchedule };
    currentSchedule[day] = (currentSchedule[day] || []).filter(item => item.time !== timeToDelete);
    updateSchedule(scheduleType, currentSchedule);
  };

  const handleResetAllData = () => {
    if (!window.confirm('Hapus SEMUA data?')) return;
    localStorage.clear();
    window.location.reload();
  };

  const handleSelectSchedule = (schedule: ScheduleType) => setSelectedSchedule(schedule);
  const handleBackToMenu = () => setSelectedSchedule(null);

  const { detailedConflicts, conflictSetForView } = useMemo(() => {
    return calculateConflicts(mtsSchedule, maSchedule, ignoredTeachers);
  }, [mtsSchedule, maSchedule]);
  
  const { mtsSubjects, maSubjects } = useMemo(() => {
    const getUniqueSubjects = (school: 'Mts' | 'Ma'): Subject[] => {
      const relevantAssignments = teachingAssignments.filter(a => school === 'Mts' ? a.teachesInMts : a.teachesInMa);
      const uniqueSubjects = new Map<string, Subject>();
      relevantAssignments.forEach(a => {
        if (!ignoredSubjects.some(ignored => a.subjectName.toUpperCase().includes(ignored.toUpperCase()))) {
          uniqueSubjects.set(a.subjectName, { id: a.subjectName, name: a.subjectName });
        }
      });
      return Array.from(uniqueSubjects.values()).sort((a,b) => a.name.localeCompare(b.name));
    };

    return {
      mtsSubjects: [...getUniqueSubjects('Mts'), { id: 'ISTIRAHAT', name: 'ISTIRAHAT' }, { id: 'ISTIRAHAT & SHOLAT', name: 'ISTIRAHAT & SHOLAT' }],
      maSubjects: [...getUniqueSubjects('Ma'), { id: 'ISTIRAHAT', name: 'ISTIRAHAT' }, { id: 'ISTIRAHAT & SHOLAT', name: 'ISTIRAHAT & SHOLAT' }],
    };
  }, [teachingAssignments]);

  const renderContent = () => {
    switch (selectedSchedule) {
      case 'MTs':
        return <ScheduleView scheduleType="MTs" title="Jadwal Pelajaran MTs" scheduleData={mtsSchedule} classLevels={['Kelas 7', 'Kelas 8', 'Kelas 9']} onBack={handleBackToMenu} interScheduleConflicts={conflictSetForView} subjects={mtsSubjects} teachingAssignments={teachingAssignments} onScheduleUpdate={handleScheduleUpdate} onAddDay={handleAddDay} onDeleteDay={handleDeleteDay} onAddRow={handleAddRow} onDeleteRow={handleDeleteRow} />;
      case 'MA':
        return <ScheduleView scheduleType="MA" title="Jadwal Pelajaran MA" scheduleData={maSchedule} classLevels={['Kelas 10', 'Kelas 11', 'Kelas 12']} onBack={handleBackToMenu} interScheduleConflicts={conflictSetForView} subjects={maSubjects} teachingAssignments={teachingAssignments} onScheduleUpdate={handleScheduleUpdate} onAddDay={handleAddDay} onDeleteDay={handleDeleteDay} onAddRow={handleAddRow} onDeleteRow={handleDeleteRow} />;
      case 'DataManagementMts':
        return <DataManagementView assignments={teachingAssignments} onAssignmentsChange={handleAssignmentsUpdate} onBack={handleBackToMenu} schoolFilterType="MTs" />;
      case 'DataManagementMa':
        return <DataManagementView assignments={teachingAssignments} onAssignmentsChange={handleAssignmentsUpdate} onBack={handleBackToMenu} schoolFilterType="MA" />;
      default:
        return <MainMenu onSelect={handleSelectSchedule} conflicts={detailedConflicts} onResetAllData={handleResetAllData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-primary-100 selection:text-primary-700">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex items-start justify-center">
        <div className="w-full">
          {showConflictNotification && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl transition-all animate-bounce font-bold text-lg border-4 border-white">
              {conflictNotificationMessage}
            </div>
          )}
          {showAppNotification && (
            <div className={`fixed bottom-8 right-8 z-[100] ${appNotificationType === 'success' ? 'bg-green-600' : 'bg-blue-600'} text-white px-6 py-3 rounded-xl shadow-xl transition-all animate-slide-up font-semibold`}>
              {appNotificationMessage}
            </div>
          )}
          {renderContent()}
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
