
import React, { useState, useMemo, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import ScheduleView from './components/ScheduleView';
import Header from './components/Header';
import Footer from './components/Footer';
import DataManagementView from './components/DataManagementView';
import { MTS_SCHEDULE_BY_CLASS, MA_SCHEDULE_BY_CLASS, EMPTY_SCHEDULE_ROW } from './constants/scheduleData';
import type { ScheduleType, ScheduleByClass, Conflict, ConflictDetail, Teacher, Subject, TeachingAssignment, ScheduleByClassItem } from './types';

// Define ignored subjects directly in App.tsx for consistent logic
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

// Helper function to calculate conflicts
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
    // Load master data (TeachingAssignments)
    const savedAssignments = localStorage.getItem('teachingAssignments');
    if (savedAssignments && JSON.parse(savedAssignments).length > 0) { // Check if not empty array
      setTeachingAssignments(JSON.parse(savedAssignments));
    } else {
      // Initialize from constants for a baseline, if localStorage is empty or just `[]`
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
              teacherNameMap.set(teacher, `(Nama untuk ${teacher})`);
            }
            const assignment = assignmentMap.get(key)!;
            if (school === 'Mts') assignment.teachesInMts = true;
            if (school === 'Ma') assignment.teachesInMa = true;
          });
        });
      };
      
      // Only process constants if localStorage was truly empty or contained an empty array.
      // Otherwise, keep it empty if the user intentionally cleared it to start fresh.
      if (!savedAssignments) { // Only run this if nothing at all was saved, assuming a fresh start
        processScheduleForInit(MTS_SCHEDULE_BY_CLASS, 'Mts');
        processScheduleForInit(MA_SCHEDULE_BY_CLASS, 'Ma');
        const initialAssignments: TeachingAssignment[] = Array.from(assignmentMap.values()).map(assignment => ({
          ...assignment,
          id: self.crypto.randomUUID(),
          teacherName: teacherNameMap.get(assignment.teacherCode) || '(Nama tidak ditemukan)',
        })).sort((a,b) => a.teacherCode.localeCompare(b.teacherCode, undefined, {numeric: true}) || a.subjectName.localeCompare(b.subjectName));
        setTeachingAssignments(initialAssignments);
        localStorage.setItem('teachingAssignments', JSON.stringify(initialAssignments));
      } else if (JSON.parse(savedAssignments).length === 0) {
        // If it was explicitly saved as an empty array, keep it empty to respect user's reset
        setTeachingAssignments([]);
        localStorage.setItem('teachingAssignments', JSON.stringify([]));
      }
    }

    // Load schedule data
    const savedMtsSchedule = localStorage.getItem('mtsSchedule');
    setMtsSchedule(savedMtsSchedule && Object.keys(JSON.parse(savedMtsSchedule)).length > 0 ? JSON.parse(savedMtsSchedule) : MTS_SCHEDULE_BY_CLASS);

    const savedMaSchedule = localStorage.getItem('maSchedule');
    setMaSchedule(savedMaSchedule && Object.keys(JSON.parse(savedMaSchedule)).length > 0 ? JSON.parse(savedMaSchedule) : MA_SCHEDULE_BY_CLASS);

  }, []);

  useEffect(() => {
    if (showAppNotification) {
      const timer = setTimeout(() => {
        setShowAppNotification(false);
        setAppNotificationMessage('');
        setAppNotificationType('info');
      }, 3000); // Hide after 3 seconds
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
      let newTeacherCode = itemToUpdate[`teacher${classKey}`]; // Keep current teacher code by default

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
            newTeacherCode = "-"; // If no assignment found for the subject and school type
          }
        } else {
          newTeacherCode = "-"; // Ignored subjects always have '-' teacher code
        }
        itemToUpdate[`teacher${classKey}`] = newTeacherCode;

      } else if (field === 'time') { // Handle time update
        const newTime = value.trim();
        if (newTime === oldTime) { // No change, just close editing
            return;
        }
        // Check for duplicate time slot in the same day (optional but good UX)
        if (daySchedule.some((item, idx) => idx !== itemIndex && item.time === newTime)) {
            setAppNotificationMessage(`Slot waktu '${newTime}' sudah ada di hari ini.`);
            setAppNotificationType('error');
            setShowAppNotification(true);
            return; // Abort update
        }
        itemToUpdate.time = newTime;
        // Since time is changed, re-sort the day schedule
        currentSchedule[day] = [...daySchedule.slice(0, itemIndex), itemToUpdate, ...daySchedule.slice(itemIndex + 1)]
                                .sort((a,b) => a.time.localeCompare(b.time));
        
        updateSchedule(scheduleType, currentSchedule);
        setAppNotificationMessage(`Slot waktu berhasil diubah menjadi '${newTime}'.`);
        setAppNotificationType('success');
        setShowAppNotification(true);
        return; // Return early as schedule is already updated
      }
      else { 
        // This branch for 'teacher' field is technically not reached by UI interaction
        // anymore since teacher cells are no longer editable dropdowns.
        // Keeping for robustness in case of programmatic updates or future extensions.
        itemToUpdate[`teacher${classKey}`] = value;
        newTeacherCode = value; // Update newTeacherCode if directly setting teacher
      }
      
      // --- Conflict Detection before setting state ---
      // The 'time' field is handled by an early return. At this point, `field` is either 'subject' or 'teacher'.
      // Therefore, `field !== 'time'` is always true and redundant.
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
        
        const keyToCheck = `${day}-${oldTime}-${newTeacherCode}`; // Use oldTime if current time isn't changed
        if (potentialConflictSet.has(keyToCheck)) {
          setConflictNotificationMessage(`Bentrok: Guru ${newTeacherCode} memiliki jadwal di jam yang sama!`);
          setShowConflictNotification(true);
          setTimeout(() => setShowConflictNotification(false), 5000); // Hide after 5 seconds
        } else {
          // If no conflict, ensure previous notification is cleared
          setShowConflictNotification(false);
          setConflictNotificationMessage('');
        }
      } else { // Clear notification if teacher becomes ignored/empty and not updating time
        setShowConflictNotification(false);
        setConflictNotificationMessage('');
      }
      // --- End Conflict Detection ---

      // Only update if not handled by the 'time' field block
      // The 'time' field is handled by an early return. At this point, `field` is either 'subject' or 'teacher'.
      // Therefore, `field !== 'time'` is always true and redundant.
      daySchedule[itemIndex] = itemToUpdate; // Apply changes to the mutable copy for state update
      currentSchedule[day] = daySchedule;
      updateSchedule(scheduleType, currentSchedule);
    }
  };

  const handleAddDay = (scheduleType: 'MTs' | 'MA') => {
    const newDayName = prompt('Masukkan nama hari baru (contoh: Minggu):');
    if (!newDayName || newDayName.trim() === '') {
      return;
    }
    const normalizedNewDayName = newDayName.trim();
    const currentSchedule = scheduleType === 'MTs' ? { ...mtsSchedule } : { ...maSchedule };
    
    if (Object.keys(currentSchedule).includes(normalizedNewDayName)) {
      setAppNotificationMessage(`Hari '${normalizedNewDayName}' sudah ada.`);
      setAppNotificationType('error');
      setShowAppNotification(true);
      return;
    }

    currentSchedule[normalizedNewDayName] = []; // Add with an empty schedule for the day
    const sortedDays = Object.keys(currentSchedule).sort((a, b) => {
      const dayOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu", "Minggu"];
      const indexA = dayOrder.indexOf(a);
      const indexB = dayOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    const newSortedSchedule: ScheduleByClass = {};
    sortedDays.forEach(day => {
      newSortedSchedule[day] = currentSchedule[day];
    });

    updateSchedule(scheduleType, newSortedSchedule);
    setAppNotificationMessage(`Hari '${normalizedNewDayName}' berhasil ditambahkan.`);
    setAppNotificationType('success');
    setShowAppNotification(true);
  };

  const handleDeleteDay = (scheduleType: 'MTs' | 'MA', dayToDelete: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus hari '${dayToDelete}' beserta seluruh jadwalnya?`)) {
      return;
    }
    const currentSchedule = scheduleType === 'MTs' ? { ...mtsSchedule } : { ...maSchedule };
    delete currentSchedule[dayToDelete];
    updateSchedule(scheduleType, currentSchedule);
    setAppNotificationMessage(`Hari '${dayToDelete}' berhasil dihapus.`);
    setAppNotificationType('success');
    setShowAppNotification(true);
  };

  const handleAddRow = (scheduleType: 'MTs' | 'MA', day: string) => {
    const newTimeSlot = prompt('Masukkan slot waktu baru (contoh: HH:MM - HH:MM):');
    if (!newTimeSlot || newTimeSlot.trim() === '') {
      return;
    }
    const normalizedNewTimeSlot = newTimeSlot.trim();
    const currentSchedule = scheduleType === 'MTs' ? { ...mtsSchedule } : { ...maSchedule };
    const daySchedule = [...(currentSchedule[day] || [])];

    if (daySchedule.some(item => item.time === normalizedNewTimeSlot)) {
      setAppNotificationMessage(`Slot waktu '${normalizedNewTimeSlot}' sudah ada di hari ini.`);
      setAppNotificationType('error');
      setShowAppNotification(true);
      return;
    }

    const newRow: ScheduleByClassItem = {
      time: normalizedNewTimeSlot,
      ...EMPTY_SCHEDULE_ROW
    };
    
    const updatedDaySchedule = [...daySchedule, newRow].sort((a,b) => a.time.localeCompare(b.time));
    currentSchedule[day] = updatedDaySchedule;
    
    updateSchedule(scheduleType, currentSchedule);
    setAppNotificationMessage(`Baris baru untuk slot waktu '${normalizedNewTimeSlot}' berhasil ditambahkan.`);
    setAppNotificationType('success');
    setShowAppNotification(true);
  };

  const handleDeleteRow = (scheduleType: 'MTs' | 'MA', day: string, timeToDelete: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus baris untuk slot waktu '${timeToDelete}'?`)) {
      return;
    }
    const currentSchedule = scheduleType === 'MTs' ? { ...mtsSchedule } : { ...maSchedule };
    currentSchedule[day] = (currentSchedule[day] || []).filter(item => item.time !== timeToDelete);
    updateSchedule(scheduleType, currentSchedule);
    setAppNotificationMessage(`Baris untuk slot waktu '${timeToDelete}' berhasil dihapus.`);
    setAppNotificationType('success');
    setShowAppNotification(true);
  };

  const handleResetAllData = () => {
    if (!window.confirm('Apakah Anda yakin ingin mereset semua data jadwal dan penugasan guru? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    localStorage.removeItem('mtsSchedule');
    localStorage.removeItem('maSchedule');
    localStorage.removeItem('teachingAssignments');

    setMtsSchedule({});
    setMaSchedule({});
    setTeachingAssignments([]);
    setSelectedSchedule(null); // Go back to main menu after reset
    setAppNotificationMessage('Semua data berhasil direset.');
    setAppNotificationType('success');
    setShowAppNotification(true);
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
        // Only include subjects that are not in the ignored list
        if (!ignoredSubjects.some(ignored => a.subjectName.toUpperCase().includes(ignored.toUpperCase()))) {
          if (!uniqueSubjects.has(a.subjectName)) {
            uniqueSubjects.set(a.subjectName, { id: a.subjectName, name: a.subjectName });
          }
        }
      });
      return Array.from(uniqueSubjects.values()).sort((a,b) => a.name.localeCompare(b.name));
    };

    return {
      mtsSubjects: [...getUniqueSubjects('Mts'), { id: 'ISTIRAHAT', name: 'ISTIRAHAT' }, { id: 'ISTIRAHAT & SHOLAT', name: 'ISTIRAHAT & SHOLAT' }], // Add breaks back for subject dropdown
      maSubjects: [...getUniqueSubjects('Ma'), { id: 'ISTIRAHAT', name: 'ISTIRAHAT' }, { id: 'ISTIRAHAT & SHOLAT', name: 'ISTIRAHAT & SHOLAT' }], // Add breaks back for subject dropdown
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

  const getNotificationClass = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-7xl">
          {showConflictNotification && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg transition-opacity duration-300 ease-in-out opacity-100 font-bold text-lg">
              {conflictNotificationMessage}
            </div>
          )}
          {showAppNotification && (
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${getNotificationClass(appNotificationType)} text-white px-6 py-3 rounded-md shadow-lg transition-opacity duration-300 ease-in-out opacity-100 font-bold text-lg`}>
              {appNotificationMessage}
            </div>
          )}
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;