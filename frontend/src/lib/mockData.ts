// Client Mock Database for EduTrack SaaS

export interface MockStudent {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  class: string;
  section: string;
  fatherName: string;
  motherName: string;
  aadharNo: string;
  phone: string;
  balanceDue: number;
  paidAmount: number;
  parentEmail: string;
}

export interface MockTeacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  basicSalary: number;
  qualification: string;
  subjects: string[];
  workload: number; // periods/week
}

export interface MockParent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[]; // names of children
}

// Helper generators
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const subjectsList = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'History', 'Computer Science', 'Civics'];
const classesList = ['Grade 10', 'Grade 9', 'Grade 8', 'Grade 11', 'Grade 12'];
const sectionsList = ['Section A', 'Section B'];

// Generate 10 Parents
export const mockParents: MockParent[] = Array.from({ length: 10 }).map((_, idx) => {
  const name = `${firstNames[idx % firstNames.length]} ${lastNames[(idx + 5) % lastNames.length]}`;
  return {
    id: `parent-uuid-${idx + 1}`,
    name,
    email: `parent.${name.toLowerCase().replace(' ', '')}@example.com`,
    phone: `999-333-000${idx}`,
    children: [],
  };
});

// Generate 100 Students
export const mockStudents: MockStudent[] = Array.from({ length: 100 }).map((_, idx) => {
  const fName = firstNames[idx % firstNames.length];
  const lName = lastNames[(idx + idx) % lastNames.length];
  const name = `${fName} ${lName}`;
  const studentClass = classesList[idx % classesList.length];
  const studentSection = sectionsList[idx % sectionsList.length];
  
  // Assign to one of the 10 parents
  const parentIdx = idx % 10;
  const parent = mockParents[parentIdx];
  parent.children.push(name);

  const totalFee = 15000;
  const discount = idx % 5 === 0 ? 3000 : 0;
  const paidAmount = idx % 3 === 0 ? totalFee - discount : idx % 2 === 0 ? 5000 : 0;

  return {
    id: `student-uuid-${idx + 1}`,
    name,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}${idx + 1}@school.com`,
    rollNo: `10${String(idx + 1).padStart(3, '0')}`,
    class: studentClass,
    section: studentSection,
    fatherName: parent.name,
    motherName: `Mother of ${fName}`,
    aadharNo: `1111-2222-33${String(idx + 1).padStart(2, '0')}`,
    phone: `888-555-0${String(idx + 1).padStart(3, '0')}`,
    balanceDue: totalFee - discount - paidAmount,
    paidAmount,
    parentEmail: parent.email,
  };
});

// Generate 20 Teachers
export const mockTeachers: MockTeacher[] = Array.from({ length: 20 }).map((_, idx) => {
  const name = `Teacher ${firstNames[(idx + 12) % firstNames.length]} ${lastNames[(idx + 8) % lastNames.length]}`;
  const subjects = [subjectsList[idx % subjectsList.length], subjectsList[(idx + 2) % subjectsList.length]];
  const qualifications = ['M.Sc in Physics', 'MA in Literature', 'PhD in Mathematics', 'B.Ed & MS in Science'];
  return {
    id: `teacher-uuid-${idx + 1}`,
    name,
    email: `teacher.${name.split(' ')[1].toLowerCase()}@school.com`,
    employeeId: `EMP-TCH-${String(idx + 1).padStart(2, '0')}`,
    designation: idx === 0 ? 'Head of Faculty' : 'Senior Teacher',
    basicSalary: 60000 + (idx * 1500),
    qualification: qualifications[idx % qualifications.length],
    subjects,
    workload: 15 + (idx % 8),
  };
});

// Timetable Matrix (Monday - Friday)
export const mockTimetable = [
  { day: 'Monday', period: 1, class: 'Grade 10 - Section A', subject: 'Mathematics', teacher: 'Teacher James Smith' },
  { day: 'Monday', period: 2, class: 'Grade 10 - Section A', subject: 'Physics', teacher: 'Teacher Marie Curie' },
  { day: 'Monday', period: 3, class: 'Grade 10 - Section A', subject: 'English', teacher: 'Teacher Sarah Moore' },
  { day: 'Tuesday', period: 1, class: 'Grade 10 - Section A', subject: 'Chemistry', teacher: 'Teacher Marie Curie' },
  { day: 'Tuesday', period: 2, class: 'Grade 10 - Section A', subject: 'Computer Science', teacher: 'Teacher Alan Turing' },
  { day: 'Wednesday', period: 1, class: 'Grade 10 - Section A', subject: 'Mathematics', teacher: 'Teacher James Smith' },
  { day: 'Thursday', period: 1, class: 'Grade 10 - Section A', subject: 'Physics', teacher: 'Teacher Marie Curie' },
  { day: 'Friday', period: 1, class: 'Grade 10 - Section A', subject: 'History', teacher: 'Teacher Sarah Moore' },
];

// Attendance Records (mock statistics)
export const mockAttendanceStats = {
  Grade10A: { total: 24, present: 22, absent: 2 },
  Grade10B: { total: 22, present: 21, absent: 1 },
  Grade9A: { total: 28, present: 26, absent: 2 },
  attendanceTrend: [
    { date: 'Mon', rate: 94 },
    { date: 'Tue', rate: 96 },
    { date: 'Wed', rate: 95 },
    { date: 'Thu', rate: 97 },
    { date: 'Fri', rate: 93 },
  ],
};

// Exam Records
export const mockExams = [
  { id: 'exam-1', name: 'First Term Mid-Term', date: '2026-09-15', status: 'Completed' },
  { id: 'exam-2', name: 'Quarterly Session Exams', date: '2026-11-20', status: 'Completed' },
  { id: 'exam-3', name: 'Final Semester Evaluation', date: '2027-04-10', status: 'Scheduled' },
];

// Academic settings
export const mockAcademicYears = [
  { id: 'ay-1', name: '2026-2027', startDate: '2026-06-01', endDate: '2027-05-31', status: 'Active' },
  { id: 'ay-2', name: '2025-2026', startDate: '2025-06-01', endDate: '2026-05-31', status: 'Completed' },
];

// Expense statistics
export const mockExpenses = [
  { id: 'exp-1', category: 'Rent', amount: 50000, date: '2026-06-01', status: 'Paid', mode: 'Bank Transfer' },
  { id: 'exp-2', category: 'Electricity', amount: 8400, date: '2026-06-10', status: 'Paid', mode: 'UPI' },
  { id: 'exp-3', category: 'Library Books Acquisition', amount: 15000, date: '2026-06-12', status: 'Paid', mode: 'Bank Transfer' },
  { id: 'exp-4', category: 'Water Utilities', amount: 2400, date: '2026-06-15', status: 'Pending', mode: 'Cash' },
];

// Library Catalog
export const mockBooks = [
  { id: 'bk-1', title: 'Foundation Physics', author: 'H.C. Verma', isbn: '9783161484100', category: 'Science', total: 10, available: 8 },
  { id: 'bk-2', title: 'Calculus Volume 1', author: 'Tom M. Apostol', isbn: '9780471000051', category: 'Mathematics', total: 5, available: 4 },
  { id: 'bk-3', title: 'Core Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '9780132126953', category: 'Computer Science', total: 8, available: 8 },
  { id: 'bk-4', title: 'World History Digest', author: 'Arnold Toynbee', isbn: '9780195066548', category: 'History', total: 4, available: 3 },
];

// Activity log audits
export const mockActivityLogs = [
  { id: 'log-1', user: 'Principal Sarah Jenkins', role: 'SCHOOL_ADMIN', action: 'USER_LOGIN', entity: 'Session', details: 'Principal Sarah Jenkins logged in successfully.', time: '10 mins ago' },
  { id: 'log-2', user: 'Teacher James Smith', role: 'TEACHER', action: 'RECORD_CREATE', entity: 'AttendanceSession', details: 'Submitted attendance for Grade 10 Section A.', time: '2 hours ago' },
  { id: 'log-3', user: 'Principal Sarah Jenkins', role: 'SCHOOL_ADMIN', action: 'RECORD_UPDATE', entity: 'Invoice', details: 'Applied 3000 discount to student John Doe.', time: '4 hours ago' },
];
