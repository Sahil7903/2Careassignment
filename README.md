# ClinicFlow Architecture: Serverless Voice AI Agent

A production-grade, modular system for real-time clinical appointment booking, specifically architected for serverless deployments on Netlify.

## 🚀 Overview

This agent utilizes a **stateless request-response model** to provide low-latency voice interactions. By collapsing the AI stack into a multimodal pipeline, it achieves high performance without the need for persistent servers or open WebSockets.

## 🛠 Project Structure

```text
voice-ai-agent/
├── netlify/
│   └── functions/          # Serverless entry points
│       ├── process-voice.ts # Main AI Pipeline
│       └── appointment.ts   # Direct CRUD API
├── agent/
│   ├── reasoning.ts        # Prompt design & context
│   └── tools.ts            # Scheduling & DB logic
├── services/
│   └── audio.ts            # STT/TTS abstractions
├── memory/
│   ├── session.ts          # Upstash (Redis) logic
│   └── persistent.ts       # PostgreSQL (ACID) logic
└── docs/                   # Architecture & Design
```

## ⚙️ Environment Variables

Add the following to your Netlify environment settings:

```env
GEMINI_API_KEY=          # Google AI Studio Key
DATABASE_URL=            # PostgreSQL connection string
UPSTASH_REDIS_REST_URL=  # Upstash Redis endpoint
UPSTASH_REDIS_REST_TOKEN= # Upstash Redis token
```

## 📦 Deployment Steps

1.  **Clone the Repository**: Ensure the structure matches the layout above.
2.  **Setup External Data**:
    -   Provision a PostgreSQL database (e.g., Supabase or Neon).
    -   Provision a Redis instance (Upstash is recommended for REST-based serverless).
3.  **Configure Netlify**:
    -   Link your repository to Netlify.
    -   Configure the `netlify.toml` for function discovery.
    -   Add environment variables.
4.  **Local Development**:
    ```bash
    npm install
    netlify dev
    ```

## ⏱ Latency Targets

| Layer | Optimization | Est. Latency |
| :--- | :--- | :--- |
| **Ingress** | HTTP POST (No WS Handshake) | 20ms |
| **Reasoning** | Multimodal Gemini (STT+LLM) | 220ms |
| **Tool / DB** | Prepared queries / Connection pooling | 40ms |
| **Synthesis** | Gemini Lightning TTS | 150ms |
| **Total** | **Sub-450ms E2E** | **430ms** |

## ⚠️ Limitations & Trade-offs

- **Statelessness**: Since functions are stateless, we rely heavily on Redis for context. Large conversation histories may increase latency due to I/O.
- **WebSocket Simulation**: Real-time "interruptions" are harder to handle in a request-response model compared to bi-directional streams.
- **Cold Starts**: Netlify functions may experience initial latency on first invocation; keep functions "warm" via periodic pings if high traffic is expected.

## 🔒 Security

- **Database Safety**: All SQL queries use prepared statements to prevent injection.
- **Session Isolation**: Session IDs are used to partition memory in Redis.
- **HIPAA Compliance**: For production, ensure your database and AI provider (Google Cloud Vertex AI/Studio) have BAA (Business Associate Agreements) and data encryption at rest.
