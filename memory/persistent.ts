import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('clinic.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    preferred_language TEXT DEFAULT 'English',
    last_doctor_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS doctor_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
  );
`);

// Seed some data
const seedDoctors = db.prepare('INSERT OR IGNORE INTO doctors (id, name, specialty) VALUES (?, ?, ?)');
seedDoctors.run('d1', 'Dr. Smith', 'General Physician');
seedDoctors.run('d2', 'Dr. Sharma', 'Cardiologist');

const seedSchedule = db.prepare('INSERT OR IGNORE INTO doctor_schedule (doctor_id, date, start_time, end_time) VALUES (?, ?, ?, ?)');
const today = new Date().toISOString().split('T')[0];
seedSchedule.run('d1', today, '09:00', '10:00');
seedSchedule.run('d1', today, '10:00', '11:00');
seedSchedule.run('d2', today, '14:00', '15:00');

export interface PatientRecord {
  id: string;
  name: string;
  preferred_language: string;
  last_doctor_id?: string;
}

export interface AppointmentRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: string;
}

export const PersistentMemory = {
  getPatient: (id: string): PatientRecord | undefined => {
    return db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as PatientRecord;
  },
  
  upsertPatient: (patient: Partial<PatientRecord> & { id: string }) => {
    const existing = PersistentMemory.getPatient(patient.id);
    if (existing) {
      db.prepare('UPDATE patients SET preferred_language = ?, last_doctor_id = ? WHERE id = ?')
        .run(patient.preferred_language || existing.preferred_language, patient.last_doctor_id || existing.last_doctor_id, patient.id);
    } else {
      db.prepare('INSERT INTO patients (id, name, preferred_language) VALUES (?, ?, ?)')
        .run(patient.id, patient.name || 'Unknown', patient.preferred_language || 'English');
    }
  },

  getAvailableSlots: (doctorId: string, date: string) => {
    return db.prepare('SELECT * FROM doctor_schedule WHERE doctor_id = ? AND date = ? AND is_booked = FALSE')
      .all(doctorId, date);
  },

  bookAppointment: (patientId: string, doctorId: string, date: string, time: string) => {
    const slot = db.prepare('SELECT id FROM doctor_schedule WHERE doctor_id = ? AND date = ? AND start_time = ? AND is_booked = FALSE')
      .get(doctorId, date, time) as { id: number } | undefined;
    
    if (!slot) throw new Error('Slot unavailable');

    const appointmentId = uuidv4();
    const transaction = db.transaction(() => {
      db.prepare('UPDATE doctor_schedule SET is_booked = TRUE WHERE id = ?').run(slot.id);
      db.prepare('INSERT INTO appointments (id, patient_id, doctor_id, date, time) VALUES (?, ?, ?, ?, ?)')
        .run(appointmentId, patientId, doctorId, date, time);
      db.prepare('UPDATE patients SET last_doctor_id = ? WHERE id = ?').run(doctorId, patientId);
    });

    transaction();
    return appointmentId;
  },

  cancelAppointment: (appointmentId: string) => {
    const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId) as AppointmentRecord | undefined;
    if (!appt) throw new Error('Appointment not found');

    const transaction = db.transaction(() => {
      db.prepare('UPDATE appointments SET status = "cancelled" WHERE id = ?').run(appointmentId);
      db.prepare('UPDATE doctor_schedule SET is_booked = FALSE WHERE doctor_id = ? AND date = ? AND start_time = ?')
        .run(appt.doctor_id, appt.date, appt.time);
    });

    transaction();
  }
};
