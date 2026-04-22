import { ToolLibrary } from '../../agent/tools.ts';

export const handler = async (event) => {
  try {
    const { action, args } = JSON.parse(event.body || '{}');

    let result;
    switch (action) {
      case 'check':
        result = await ToolLibrary.checkAvailability(args.doctorId, args.date);
        break;
      case 'book':
        result = await ToolLibrary.bookAppointment(args.patientId, args.doctorId, args.date, args.time);
        break;
      case 'cancel':
        result = await ToolLibrary.cancelAppointment(args.appointmentId);
        break;
      default:
        return { statusCode: 400, body: 'Invalid action' };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
