import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Uses Gemini as a combined STT and Reasoning engine
 * Accepts base64 audio and returns transcribed text + intent
 */
export async function speechToIntent(audioBase64: string, systemInstruction: string) {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "audio/wav", // Adjusted as per incoming chunk
              data: audioBase64
            }
          },
          { text: "Transcribe the audio and then respond based on your instructions. Return a JSON with { transcription, language, textResponse, toolCalls }." }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
}

/**
 * Text to Speech using Gemini's lightning-fast TTS model
 */
export async function textToSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("TTS generation failed");
  return base64Audio;
}
