import { speechToIntent, textToSpeech } from '../../services/audio.ts';
import { ToolLibrary } from '../../agent/tools.ts';
import { SYSTEM_INSTRUCTION, getAgentContext, updateAgentContext } from '../../agent/reasoning.ts';

export const handler = async (event) => {
  const tStart = Date.now();
  const timings: any = {};

  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const { audio, sessionId, userId } = JSON.parse(event.body || '{}');
    if (!audio || !sessionId) return { statusCode: 400, body: 'Missing audio or sessionId' };

    // 1. Context Retrieval
    const context = (await getAgentContext(sessionId)) as { history: any[] };
    const enrichedInstruction = `${SYSTEM_INSTRUCTION}\n\nUSER_HISTORY: ${JSON.stringify(context.history)}`;

    // 2. Multimodal Processing (STT + Reasoning)
    const tSttStart = Date.now();
    const result = await speechToIntent(audio, enrichedInstruction);
    timings.stt_ms = Date.now() - tSttStart;
    timings.agent_ms = timings.stt_ms; // Gemini does both in parallel

    // 3. Tool Execution
    const tToolStart = Date.now();
    let toolResults = [];
    if (result.toolCalls) {
      for (const call of result.toolCalls) {
        const toolFunc = (ToolLibrary as any)[call.name];
        if (toolFunc) {
          const toolRes = await toolFunc.apply(ToolLibrary, Object.values(call.args));
          toolResults.push({ call: call.name, result: toolRes });
        }
      }
    }
    timings.tool_ms = Date.now() - tToolStart;

    // 4. Final Response Refinement (If tools were called, we might need a summary)
    let finalPrompt = result.textResponse;
    if (toolResults.length > 0) {
      // Small re-reasoning if tools changed the state significantly
      // (Simplified for latency: we mostly trust the agent's first plan or append result)
      finalPrompt = `${result.textResponse}\n(System note: Tool results were ${JSON.stringify(toolResults)})`;
    }

    // 5. TTS Generation
    const tTtsStart = Date.now();
    const voiceBase64 = await textToSpeech(finalPrompt);
    timings.tts_ms = Date.now() - tTtsStart;

    // 6. State Persistence
    await updateAgentContext(sessionId, { user: result.transcription, bot: finalPrompt }, context.history);

    timings.total_ms = Date.now() - tStart;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio: voiceBase64,
        text: finalPrompt,
        transcription: result.transcription,
        metrics: timings
      }),
    };
  } catch (error: any) {
    console.error('Pipeline Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
