-- Database Schema for Clinical Appointment Booking (PostgreSQL)

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, cancelled, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctor_schedule (
    id SERIAL PRIMARY KEY,
    doctor_id VARCHAR(255) NOT NULL,
    available_date DATE NOT NULL,
    available_slots TEXT[] NOT NULL, -- Array of times (e.g., ['09:00', '10:00'])
    UNIQUE(doctor_id, available_date)
);

-- Initial Mock Data
INSERT INTO doctor_schedule (doctor_id, available_date, available_slots)
VALUES 
('dr_smith', CURRENT_DATE, ARRAY['09:00', '10:00', '11:00', '14:00', '15:00']),
('dr_sharma', CURRENT_DATE, ARRAY['10:00', '11:00', '13:00', '16:00'])
ON CONFLICT DO NOTHING;
