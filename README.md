# ClinicFlow Voice AI Agent

A professional, real-time multilingual voice AI agent for clinical appointment booking.

## Quick Start
1. **Infrastructure**:
   ```bash
   npm install
   npm run dev
   ```

## System Components
- `backend/api/websocket.ts`: WebSocket orchestration and metrics tracking.
- `agent/reasoning.ts`: System prompts and tool definitions.
- `agent/tools.ts`: Business logic for scheduling.
- `memory/persistent.ts`: SQL-based durable memory (SQLite).
- `memory/session.ts`: Redis-style transient session cache.
- `services/audio.ts`: Logic for audio stream handling.
- `scheduler/campaigns.ts`: Outbound notification engine.

## Key Features
- **<450ms Latency**: Achieved through a unified multimodal pipeline.
- **Multilingual**: Native support for English, Hindi, and Tamil.
- **Durable Memory**: Remembers last visited doctor and patient preferences.
- **Conflict Detection**: Prevents double-booking with atomic transactions.

## Production Trade-offs
1. **Database**: Used SQLite for the portable demo; production would migrate to PostgreSQL via Prisma/SQLAlchemy.
2. **Session**: Implemented in-memory Map for the demo; production uses Redis for cluster scalability.
3. **Audio**: Browser-based simulation used for the demo preview; production integrates directly with SIP/VoIP providers.
