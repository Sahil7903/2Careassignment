# ClinicFlow: Real-Time Multilingual Voice AI Agent

## 1. Executive Summary
ClinicFlow is a production-grade voice conversational agent designed for high-concurrency clinical scheduling. It leverages a unified audio pipeline for state-of-the-art latency (<450ms) and handles complex multi-turn logic including slot conflict resolution and language switching.

## 2. Architecture Overview
The system is built on a modular "Separation of Concerns" principle:

- **Orchestration Layer (Node.js)**: Manages bi-directional WebSocket streams, session lifecycle, and infrastructure logic.
- **AI Agent Layer (Gemini Live API)**: Single-hop multimodal pipeline for STT, reasoning, and TTS.
- **Memory Layer**:
    - **Session (Memory)**: Voltatile state, history, and transient context with 30m TTL.
    - **Persistent (SQLite)**: Durable storage for patient records, preferences, and doctor schedules.
- **Tool Layer**: Encapsulated logic for database interactions (Checking slots, booking, cancelling).

## 3. Data Flow
1. **Audio Input**: 24kHz Mono PCM audio blocks streamed via WebSockets.
2. **STT & Detection**: Gemini Live API processes stream; detects intent and language (English, Hindi, Tamil) concurrently.
3. **Reasoning**: If a tool is needed (e.g., "Check Dr. Smith's schedule"), the agent emits a tool call.
4. **Execution**: The backend executes the tool against the SQL store.
5. **TTS Output**: Gemini generates synthesized audio with low-jitter parameters.
6. **Streaming Back**: Audio chunks are pushed to the client for immediate playback.

## 4. Latency Performance (<450ms Design)
| Stage | Target Latency | Optimization Strategy |
|-------|----------------|-----------------------|
| STT / Detect | 40ms | Integrated stream (no multi-hop REST) |
| Agent Reasoning | 150ms | ThinkingLevel.LOW for speed, strict JSON schemas |
| Tool Execution | 5ms | Pre-indexed SQLite / In-memory caches |
| TTS Generation | 120ms | Continuous synthesis streaming |
| **Total RTT** | **~315ms** | **Safe margin of 135ms to target** |

## 5. Security & Persistence
- **HIPAA Compliance**: Ready for data-at-rest encryption.
- **Atomic Writes**: Uses database transactions to prevent double-bookings.
- **Memory**: Session affinity ensures the agent doesn't lose context mid-call.

## 6. Known Limitations
- Currently optimized for single-patient identification per session.
- Outbound campaigns are triggered via crontab simulation (needs external trigger).
- Direct PCM playback requires browser `AudioContext` support.
