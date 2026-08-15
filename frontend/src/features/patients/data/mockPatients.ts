export interface Patient {
  id: string;
  mrn: string;
  name: string;
  avatar: string;
  dob: string;
  ageGender: string;
  phone: string;
  email: string;
  address: string;
  careUnit: string;
  floorRoom: string;
  primaryDoctor: {
    name: string;
    specialty: string;
    avatar: string;
  };
  status: 'In Care' | 'Admitted' | 'Discharged' | 'Inactive';
  riskLevel: 'High' | 'Medium' | 'Low';
  lastVisit: string;
  allergies: string[];
  admissionDate: string;
  careDays: number;
  dischargePlan: string;
  emergencyContacts: Array<{
    name: string;
    relation: string;
    phone: string;
    isPrimary?: boolean;
  }>;
  medicalConditions: Array<{
    name: string;
    diagnosedDate: string;
  }>;
  medications: Array<{
    name: string;
    dose: string;
    frequency: string;
    times: string[];
  }>;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    bloodSugar: string;
    temperature: string;
    spO2: string;
    recordedAt: string;
  };
  careTeam: Array<{
    name: string;
    role: string;
    type: 'Primary' | 'Consultant' | 'Coordinator';
    avatar: string;
  }>;
  notes: Array<{
    text: string;
    date: string;
    author: string;
  }>;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P-0001',
    mrn: 'MRN-002344',
    name: 'Robert Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    dob: 'Oct 12, 1956',
    ageGender: '67 / Male',
    phone: '(512) 555-2458',
    email: 'robert.j@email.com',
    address: '452 Elm Street, Austin, TX 78702',
    careUnit: 'Cardiology Unit',
    floorRoom: '3rd Floor - 301',
    primaryDoctor: {
      name: 'Dr. Sarah Wilson',
      specialty: 'Emergency Physician',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    },
    status: 'In Care',
    riskLevel: 'High',
    lastVisit: 'May 20, 2024 10:15 AM',
    allergies: ['Penicillin', 'Sulfa drugs'],
    admissionDate: 'Apr 15, 2024',
    careDays: 35,
    dischargePlan: 'Scheduled for May 24',
    emergencyContacts: [
      { name: 'Sarah Johnson', relation: 'Wife', phone: '(512) 555-2459', isPrimary: true },
    ],
    medicalConditions: [
      { name: 'Cardiomyopathy', diagnosedDate: 'Mar 10, 2021' },
      { name: 'Hypertension', diagnosedDate: 'Jan 15, 2019' },
    ],
    medications: [
      { name: 'Lisinopril 10 mg', dose: '1 tablet', frequency: 'Once daily', times: ['08:00 AM'] },
      { name: 'Metoprolol 50 mg', dose: '1 tablet', frequency: 'Twice daily', times: ['08:00 AM', '08:00 PM'] },
    ],
    vitals: {
      bloodPressure: '130/85 mmHg',
      heartRate: '78 bpm',
      bloodSugar: '115 mg/dL',
      temperature: '98.4 °F',
      spO2: '97 %',
      recordedAt: 'May 20, 2024 08:30 AM',
    },
    careTeam: [
      { name: 'Dr. Sarah Wilson', role: 'Primary Physician', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80' },
    ],
    notes: [
      { text: 'Patient reports stable breathing after morning medication.', date: 'May 20, 2024 08:30 AM', author: 'Nurse Sarah Wilson' },
    ],
  },
  {
    id: 'P-0002',
    mrn: 'MRN-002345',
    name: 'Patricia Smith',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    dob: 'Mar 23, 1948',
    ageGender: '76 Years / Female',
    phone: '(512) 555-8765',
    email: 'patricia.smith@email.com',
    address: '1234 Oakwood Lane, Austin, TX 78701',
    careUnit: 'Med-Surg Unit 2',
    floorRoom: '2nd Floor - 202',
    primaryDoctor: {
      name: 'Dr. Michael Brown',
      specialty: 'Cardiologist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    },
    status: 'In Care',
    riskLevel: 'High',
    lastVisit: 'May 20, 2024 09:45 AM',
    allergies: ['Penicillin', 'Sulfa drugs', 'Latex'],
    admissionDate: 'Apr 10, 2024',
    careDays: 40,
    dischargePlan: 'Not Scheduled',
    emergencyContacts: [
      { name: 'Robert Smith', relation: 'Son', phone: '(512) 555-1122', isPrimary: true },
      { name: 'Linda Smith', relation: 'Daughter', phone: '(512) 555-3344' },
    ],
    medicalConditions: [
      { name: 'Coronary Artery Disease', diagnosedDate: 'Jan 12, 2020' },
      { name: 'Hypertension', diagnosedDate: 'Feb 08, 2018' },
      { name: 'Type 2 Diabetes Mellitus', diagnosedDate: 'Mar 15, 2019' },
      { name: 'Osteoarthritis', diagnosedDate: 'Jul 22, 2021' },
    ],
    medications: [
      { name: 'Amlodipine 5 mg', dose: '1 tablet', frequency: 'Once daily', times: ['08:00 AM'] },
      { name: 'Metformin 500 mg', dose: '1 tablet', frequency: 'Twice daily', times: ['08:00 AM', '08:00 PM'] },
      { name: 'Aspirin 81 mg', dose: '1 tablet', frequency: 'Once daily', times: ['09:00 AM'] },
      { name: 'Atorvastatin 20 mg', dose: '1 tablet', frequency: 'Once daily', times: ['09:00 PM'] },
      { name: 'Vitamin D3 1000 IU', dose: '1 tablet', frequency: 'Once daily', times: ['09:00 AM'] },
    ],
    vitals: {
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      bloodSugar: '110 mg/dL',
      temperature: '98.6 °F',
      spO2: '98 %',
      recordedAt: 'May 20, 2024 08:30 AM',
    },
    careTeam: [
      { name: 'Dr. Michael Brown', role: 'Primary Physician (Cardiologist)', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80' },
      { name: 'Dr. Emily Clark', role: 'Endocrinologist', type: 'Consultant', avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80' },
      { name: 'Nurse Sarah Wilson', role: 'Primary Nurse', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80' },
      { name: 'James Anderson', role: 'Care Coordinator', type: 'Coordinator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    ],
    notes: [
      { text: 'Patient reported mild shortness of breath during early morning check.', date: 'May 20, 2024 08:30 AM', author: 'Nurse Sarah Wilson' },
      { text: 'Blood sugar level stable. Continue current insulin & Metformin dosage.', date: 'May 19, 2024 04:20 PM', author: 'Dr. Emily Clark' },
      { text: 'Medication schedule reviewed with family coordinator.', date: 'May 18, 2024 10:15 AM', author: 'Nurse Sarah Wilson' },
    ],
  },
  {
    id: 'P-0003',
    mrn: 'MRN-002346',
    name: 'Michael Davis',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    dob: 'Jul 08, 1963',
    ageGender: '60 / Male',
    phone: '(512) 555-1122',
    email: 'm.davis@email.com',
    address: '889 Pine Ave, Austin, TX 78704',
    careUnit: 'Med-Surg Unit 2',
    floorRoom: '2nd Floor - 205',
    primaryDoctor: {
      name: 'Dr. James Lee',
      specialty: 'Orthopedic Surgeon',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    },
    status: 'Admitted',
    riskLevel: 'Medium',
    lastVisit: 'May 20, 2024 08:30 AM',
    allergies: ['Latex'],
    admissionDate: 'May 18, 2024',
    careDays: 2,
    dischargePlan: 'Under Review',
    emergencyContacts: [
      { name: 'Laura Davis', relation: 'Wife', phone: '(512) 555-1123', isPrimary: true },
    ],
    medicalConditions: [
      { name: 'Knee Arthroplasty Post-Op', diagnosedDate: 'May 18, 2024' },
    ],
    medications: [
      { name: 'Ibuprofen 400 mg', dose: '1 tablet', frequency: 'Every 8 hours', times: ['08:00 AM', '04:00 PM', '12:00 AM'] },
    ],
    vitals: {
      bloodPressure: '124/82 mmHg',
      heartRate: '75 bpm',
      bloodSugar: '105 mg/dL',
      temperature: '98.8 °F',
      spO2: '99 %',
      recordedAt: 'May 20, 2024 08:30 AM',
    },
    careTeam: [
      { name: 'Dr. James Lee', role: 'Orthopedic Surgeon', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80' },
    ],
    notes: [
      { text: 'Post-op physical therapy session completed smoothly.', date: 'May 20, 2024 08:30 AM', author: 'James Anderson' },
    ],
  },
  {
    id: 'P-0004',
    mrn: 'MRN-002347',
    name: 'Linda Martinez',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    dob: 'Feb 17, 1955',
    ageGender: '69 / Female',
    phone: '(512) 555-3344',
    email: 'linda.m@email.com',
    address: '742 Evergreen Terrace, Austin, TX 78705',
    careUnit: 'Diabetes Care',
    floorRoom: '1st Floor - 104',
    primaryDoctor: {
      name: 'Dr. Emily Clark',
      specialty: 'Endocrinologist',
      avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80',
    },
    status: 'In Care',
    riskLevel: 'Medium',
    lastVisit: 'May 19, 2024 04:20 PM',
    allergies: ['Codeine'],
    admissionDate: 'May 10, 2024',
    careDays: 10,
    dischargePlan: 'Expected May 22',
    emergencyContacts: [
      { name: 'Carlos Martinez', relation: 'Husband', phone: '(512) 555-3345', isPrimary: true },
    ],
    medicalConditions: [
      { name: 'Type 1 Diabetes Mellitus', diagnosedDate: 'Feb 10, 2010' },
    ],
    medications: [
      { name: 'Insulin Glargine', dose: '20 units', frequency: 'Bedtime', times: ['10:00 PM'] },
    ],
    vitals: {
      bloodPressure: '122/78 mmHg',
      heartRate: '70 bpm',
      bloodSugar: '140 mg/dL',
      temperature: '98.5 °F',
      spO2: '98 %',
      recordedAt: 'May 19, 2024 04:20 PM',
    },
    careTeam: [
      { name: 'Dr. Emily Clark', role: 'Endocrinologist', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80' },
    ],
    notes: [
      { text: 'Insulin dosage adjusted.', date: 'May 19, 2024 04:20 PM', author: 'Dr. Emily Clark' },
    ],
  },
  {
    id: 'P-0005',
    mrn: 'MRN-002348',
    name: 'James Brown',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    dob: 'Jan 05, 1959',
    ageGender: '65 / Male',
    phone: '(512) 555-6677',
    email: 'j.brown@email.com',
    address: '321 Maple Dr, Austin, TX 78703',
    careUnit: 'General Ward',
    floorRoom: '1st Floor - 110',
    primaryDoctor: {
      name: 'Dr. Sarah Wilson',
      specialty: 'Emergency Medicine',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    },
    status: 'Admitted',
    riskLevel: 'High',
    lastVisit: 'May 19, 2024 02:10 PM',
    allergies: ['Aspirin'],
    admissionDate: 'May 15, 2024',
    careDays: 5,
    dischargePlan: 'Under Observation',
    emergencyContacts: [
      { name: 'Mary Brown', relation: 'Sister', phone: '(512) 555-6678', isPrimary: true },
    ],
    medicalConditions: [
      { name: 'Pneumonia', diagnosedDate: 'May 15, 2024' },
    ],
    medications: [
      { name: 'Azithromycin 500 mg', dose: '1 tablet', frequency: 'Once daily', times: ['09:00 AM'] },
    ],
    vitals: {
      bloodPressure: '135/88 mmHg',
      heartRate: '82 bpm',
      bloodSugar: '108 mg/dL',
      temperature: '99.2 °F',
      spO2: '95 %',
      recordedAt: 'May 19, 2024 02:10 PM',
    },
    careTeam: [
      { name: 'Dr. Sarah Wilson', role: 'Emergency Physician', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80' },
    ],
    notes: [
      { text: 'Oxygen saturation monitored continuously.', date: 'May 19, 2024 02:10 PM', author: 'Nurse Sarah Wilson' },
    ],
  },
  {
    id: 'P-0006',
    mrn: 'MRN-002349',
    name: 'Mary Williams',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    dob: 'Apr 30, 1942',
    ageGender: '82 / Female',
    phone: '(512) 555-8899',
    email: 'mary.w@email.com',
    address: '990 Cedar St, Austin, TX 78701',
    careUnit: 'Geriatrics Unit',
    floorRoom: '4th Floor - 401',
    primaryDoctor: {
      name: 'Dr. Anita Patel',
      specialty: 'Geriatric Specialist',
      avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80',
    },
    status: 'In Care',
    riskLevel: 'High',
    lastVisit: 'May 19, 2024 11:30 AM',
    allergies: ['Penicillin'],
    admissionDate: 'May 01, 2024',
    careDays: 19,
    dischargePlan: 'Long-term Care Facility',
    emergencyContacts: [
      { name: 'David Williams', relation: 'Son', phone: '(512) 555-8900', isPrimary: true },
    ],
    medicalConditions: [
      { name: 'Dementia', diagnosedDate: 'Mar 12, 2018' },
    ],
    medications: [
      { name: 'Donepezil 10 mg', dose: '1 tablet', frequency: 'At bedtime', times: ['09:00 PM'] },
    ],
    vitals: {
      bloodPressure: '118/76 mmHg',
      heartRate: '68 bpm',
      bloodSugar: '102 mg/dL',
      temperature: '98.2 °F',
      spO2: '98 %',
      recordedAt: 'May 19, 2024 11:30 AM',
    },
    careTeam: [
      { name: 'Dr. Anita Patel', role: 'Geriatric Specialist', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80' },
    ],
    notes: [
      { text: 'Cognitive assessment completed.', date: 'May 19, 2024 11:30 AM', author: 'Dr. Anita Patel' },
    ],
  },
  {
    id: 'P-0007',
    mrn: 'MRN-002350',
    name: 'David Wilson',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    dob: 'Nov 11, 1967',
    ageGender: '56 / Male',
    phone: '(512) 555-4455',
    email: 'd.wilson@email.com',
    address: '102 Oak Ave, Austin, TX 78704',
    careUnit: 'Orthopedics Unit',
    floorRoom: '3rd Floor - 308',
    primaryDoctor: {
      name: 'Dr. Michael Brown',
      specialty: 'Cardiologist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    },
    status: 'In Care',
    riskLevel: 'Low',
    lastVisit: 'May 18, 2024 03:05 PM',
    allergies: [],
    admissionDate: 'May 12, 2024',
    careDays: 6,
    dischargePlan: 'May 21',
    emergencyContacts: [
      { name: 'Jane Wilson', relation: 'Wife', phone: '(512) 555-4456', isPrimary: true },
    ],
    medicalConditions: [
      { name: 'Spinal Disc Herniation', diagnosedDate: 'Apr 02, 2024' },
    ],
    medications: [
      { name: 'Gabapentin 300 mg', dose: '1 capsule', frequency: 'Three times daily', times: ['08:00 AM', '02:00 PM', '08:00 PM'] },
    ],
    vitals: {
      bloodPressure: '120/78 mmHg',
      heartRate: '71 bpm',
      bloodSugar: '98 mg/dL',
      temperature: '98.6 °F',
      spO2: '99 %',
      recordedAt: 'May 18, 2024 03:05 PM',
    },
    careTeam: [
      { name: 'Dr. Michael Brown', role: 'Primary Physician', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80' },
    ],
    notes: [
      { text: 'Pain symptoms well managed.', date: 'May 18, 2024 03:05 PM', author: 'Dr. Michael Brown' },
    ],
  },
  {
    id: 'P-0008',
    mrn: 'MRN-002351',
    name: 'Barbara Taylor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    dob: 'Aug 19, 1949',
    ageGender: '74 / Female',
    phone: '(512) 555-9988',
    email: 'b.taylor@email.com',
    address: '601 Birch Lane, Austin, TX 78705',
    careUnit: 'Cardiology Unit',
    floorRoom: '3rd Floor - 302',
    primaryDoctor: {
      name: 'Dr. James Lee',
      specialty: 'Orthopedic Surgeon',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    },
    status: 'Discharged',
    riskLevel: 'Low',
    lastVisit: 'May 17, 2024 10:20 AM',
    allergies: ['Penicillin'],
    admissionDate: 'May 10, 2024',
    careDays: 7,
    dischargePlan: 'Completed',
    emergencyContacts: [
      { name: 'Mark Taylor', relation: 'Son', phone: '(512) 555-9989', isPrimary: true },
    ],
    medicalConditions: [
      { name: 'Atrial Fibrillation', diagnosedDate: 'Jun 10, 2022' },
    ],
    medications: [
      { name: 'Eliquis 5 mg', dose: '1 tablet', frequency: 'Twice daily', times: ['09:00 AM', '09:00 PM'] },
    ],
    vitals: {
      bloodPressure: '118/76 mmHg',
      heartRate: '68 bpm',
      bloodSugar: '104 mg/dL',
      temperature: '98.4 °F',
      spO2: '98 %',
      recordedAt: 'May 17, 2024 10:20 AM',
    },
    careTeam: [
      { name: 'Dr. James Lee', role: 'Primary Physician', type: 'Primary', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80' },
    ],
    notes: [
      { text: 'Discharged in good condition.', date: 'May 17, 2024 10:20 AM', author: 'Dr. James Lee' },
    ],
  },
];
