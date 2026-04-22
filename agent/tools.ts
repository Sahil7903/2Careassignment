import { query } from '../memory/persistent.ts';

export const ToolLibrary = {
  /**
   * Checks doctor availability for a specific date
   */
  async checkAvailability(doctorId: string, date: string) {
    const res = await query(
      'SELECT available_slots FROM doctor_schedule WHERE doctor_id = $1 AND available_date = $2',
      [doctorId, date]
    );
    
    if (res.rows.length === 0) return { error: "No availability found for this date." };
    
    // Filter out already booked slots
    const bookings = await query(
      'SELECT appointment_time FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND status = \'scheduled\'',
      [doctorId, date]
    );
    
    const bookedTimes = bookings.rows.map(r => r.appointment_time.slice(0, 5));
    const freeSlots = res.rows[0].available_slots.filter((s: string) => !bookedTimes.includes(s));
    
    return { available_slots: freeSlots };
  },

  /**
   * Books a new appointment
   */
  async bookAppointment(patientId: string, doctorId: string, date: string, time: string) {
    // 1. Conflict detection
    const conflict = await query(
      'SELECT id FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status = \'scheduled\'',
      [doctorId, date, time]
    );
    
    if (conflict.rows.length > 0) {
      const alternatives = await this.checkAvailability(doctorId, date);
      return { 
        error: "Time slot already booked.", 
        suggested_slots: (alternatives as any).available_slots 
      };
    }

    // 2. Insert record
    const result = await query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES ($1, $2, $3, $4) RETURNING id',
      [patientId, doctorId, date, time]
    );

    return { success: true, appointment_id: result.rows[0].id };
  },

  /**
   * Cancels an existing appointment
   */
  async cancelAppointment(appointmentId: number) {
    const res = await query(
      'UPDATE appointments SET status = \'cancelled\' WHERE id = $1 RETURNING id',
      [appointmentId]
    );
    
    if (res.rows.length === 0) return { error: "Appointment not found." };
    return { success: true };
  }
};
