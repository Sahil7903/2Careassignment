# Sample Multilingual Clinical Conversations

### Scenario 1: Appointment Booking (Hindi)
**Patient:** "नमस्ते, मुझे डॉक्टर स्मिथ के साथ आज का अपॉइंटमेंट बुक करना है।"  
*(Translate: Namaste, I want to book an appointment with Dr. Smith today.)*

**Agent Intent:** `checkAvailability(dr_smith, 2026-04-22)` -> `available_slots: ['10:00', '14:00']`  
**Agent Response:** "नमस्ते। डॉक्टर स्मिथ आज सुबह 10 बजे और दोपहर 2 बजे उपलब्ध हैं। आप कौन सा समय पसंद करेंगे?"  
*(Translate: Namaste. Dr. Smith is available today at 10 AM and 2 PM. Which time would you prefer?)*

**Patient:** "दोपहर 2 बजे ठीक रहेगा।"  
**Agent Response:** "बिलकुल! आपका अपॉइंटमेंट डॉक्टर स्मिथ के साथ आज दोपहर 2 बजे के लिए बुक कर दिया गया है। क्या मैं आपकी कुछ और मदद कर सकती हूँ?"

---

### Scenario 2: Cancellation (Tamil)
**Patient:** "நாளைக்கு எனக்கு இருக்கிற அப்பாயின்மென்ட்ட கேன்சல் பண்ணனும்."  
*(Translate: I need to cancel my appointment for tomorrow.)*

**Agent Intent:** `listAppointments(patient_123)` -> `Found: ID 45`  
**Agent Response:** "நிச்சயமாக. நாளைக்கான உங்கள் அப்பாயின்மென்ட் ரத்து செய்யப்பட்டது. வேறேதாவது உதவி வேண்டுமா?"  
*(Translate: Certainly. Your appointment for tomorrow has been cancelled. Anything else?)*

---

### Scenario 3: Slot Conflict Resolution (English)
**Patient:** "I'd like to see Dr. Sharma at 11 AM today."

**Agent Intent:** `bookAppointment(patient_789, dr_sharma, 2026-04-22, 11:00)` -> `Error: Time slot already booked. Alternatives: ['13:00', '16:00']`  
**Agent Response:** "I apologize, but Dr. Sharma is already booked at 11 AM. However, he has openings at 1 PM and 4 PM. Would either of those work for you?"
