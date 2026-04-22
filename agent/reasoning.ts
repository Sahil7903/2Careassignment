import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_PROMPT = `
You are a "ClinicFlow" Voice AI Agent, a professional clinical assistant.
Your goal is to help patients book, cancel, or reschedule appointments.

VOICE GUIDELINES:
- Be concise (voice conversations require brevity).
- Detect and respond in the patient's language (English, Hindi, or Tamil).
- If intent is ambiguous, ask clarifying questions.
- For scheduling conflicts, suggest the next available slot.

CONTEXT:
- You have access to patient history and doctor schedules via tools.
- Today is ${new Date().toISOString().split('T')[0]}.

STEPS:
1. Identify the patient (ask for ID if not provided).
2. Check availability or handle specific requests (cancel/reschedule).
3. Confirm details before final booking.
`;

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "checkAvailability",
    parameters: {
      type: Type.OBJECT,
      properties: {
        doctorId: { type: Type.STRING, description: "ID of the doctor (e.g., d1, d2)" },
        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" }
      },
      required: ["doctorId", "date"]
    }
  },
  {
    name: "bookAppointment",
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientId: { type: Type.STRING },
        doctorId: { type: Type.STRING },
        date: { type: Type.STRING },
        time: { type: Type.STRING, description: "Start time (HH:MM)" }
      },
      required: ["patientId", "doctorId", "date", "time"]
    }
  },
  {
    name: "cancelAppointment",
    parameters: {
      type: Type.OBJECT,
      properties: {
        appointmentId: { type: Type.STRING }
      },
      required: ["appointmentId"]
    }
  }
];
