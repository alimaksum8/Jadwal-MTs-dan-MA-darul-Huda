
export interface ScheduleItem {
  time: string;
  subject: string;
}

export type DaySchedule = ScheduleItem[];

export type Schedule = {
  [key:string]: DaySchedule;
};

export type ScheduleType = 'MTs' | 'MA' | 'DataManagementMts' | 'DataManagementMa';

// New types for class-based schedule
export interface ScheduleByClassItem {
  time: string;
  classA: string; // Grade 7 or 10
  teacherA: string;
  classB: string; // Grade 8 or 11
  teacherB: string;
  classC: string; // Grade 9 or 12
  teacherC: string;
}

export type DayScheduleByClass = ScheduleByClassItem[];

export type ScheduleByClass = {
  [key: string]: DayScheduleByClass;
};

// Types for conflict summary
export interface ConflictDetail {
  school: 'MTs' | 'MA';
  subject: string;
  class: string;
}

export interface Conflict {
  teacher: string;
  day: string;
  time: string;
  details: ConflictDetail[];
}

// For passing unique lists to dropdowns
export interface Teacher {
  id: string; // Can be a composite key or UUID
  code: string;
  name: string;
}

export interface Subject {
  id: string; // Can be the subject name
  name: string;
}

// New primary data structure for data management
export interface TeachingAssignment {
  id: string;
  teacherCode: string;
  teacherName: string;
  subjectName: string;
  teachesInMts: boolean;
  teachesInMa: boolean;
}