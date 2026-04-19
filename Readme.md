# Deputy AI Assistant

Deputy is a desktop AI copilot built with Electron, React, and TypeScript for live meeting assistance, transcription-aware responses, post-meeting summaries, and searchable meeting memory.

It combines real-time audio capture, multiple STT/LLM provider integrations, screenshot/context assistance, and retrieval-augmented search over meeting data.

## Highlights

- Live meeting lifecycle: start, assist, and end meeting sessions from a launcher and overlay UI.
- Multi-provider AI stack:
  - LLM: Gemini, Groq, OpenAI, Claude, Ollama, and custom providers.
  - STT: Google, Groq, OpenAI, Deepgram, ElevenLabs, Azure, IBM Watson, Soniox, and Deputy.
- Real-time assistant features:
  - Transcript-aware suggestions and follow-ups.
  - Contextual answer generation and recap workflows.
  - Screenshot and selective screenshot analysis flows.
- Meeting memory and search:
  - SQLite-backed meeting persistence.
  - RAG pipeline with local embedding models and vector search.
  - Live and historical meeting query support.
- Productivity integrations:
  - Google Calendar connection and upcoming event context.
  - Follow-up email drafting helpers.
  - Configurable keybinds and overlay controls.
- Desktop-first capabilities:
  - Native audio capture and processing.
  - Cross-platform desktop packaging with electron-builder.
  - Auto-update hooks via GitHub Releases.

## Tech Stack

- Desktop shell: Electron
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Main process: TypeScript (compiled to CommonJS)
- Database: better-sqlite3 + sqlite-vec
- Embeddings/classification: Transformers.js local model cache in resources/models
- Native module: Rust + napi-rs

## Repository Structure

```
.
|- electron/               # Main process, IPC, audio, services, DB, RAG
|- src/                    # Renderer app (launcher, overlay, settings, UI)
|- native-module/          # Rust native module (audio/system-level functionality)
|- scripts/                # Build, native, model, and packaging helpers
|- resources/models/       # Downloaded local embedding/classifier models
|- premium/                # Premium module (git submodule)
|- dist/                   # Renderer build output
|- dist-electron/          # Main/premium compiled output
```

## Prerequisites

- Node.js 20+ and npm
- Git
- Rust toolchain (required for native module builds)
  - Install rustup and ensure cargo is on PATH
- Platform build requirements for native Node/Electron modules:
  - Windows: Visual Studio Build Tools (C++ workload)
  - macOS: Xcode Command Line Tools
  - Linux: build-essential and related toolchain packages

## Getting Started

1. Clone the repository.
2. Initialize submodules.
3. Install dependencies.
4. Configure environment variables.
5. Run the desktop app in development mode.

```bash
git clone https://github.com/razakhan143/deputy-ai-assistant.git
cd deputy-ai-assistant
git submodule update --init --recursive
npm install
cp .env.example .env
npm run start
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

## Environment Configuration

Create a .env file based on .env.example.

### Core Keys

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GROQ_API_KEY
- OPENAI_API_KEY
- CLAUDE_API_KEY
- GEMINI_API_KEY
- GOOGLE_APPLICATION_CREDENTIALS

### Optional STT Provider Keys

- DEEPGRAM_API_KEY
- ELEVENLABS_API_KEY
- AZURE_SPEECH_KEY
- AZURE_SPEECH_REGION
- IBM_WATSON_API_KEY
- IBM_WATSON_REGION

### Local AI Defaults

- USE_OLLAMA
- OLLAMA_MODEL
- OLLAMA_URL
- DEFAULT_MODEL

Notes:

- You do not need every key. Configure only the providers you plan to use.
- Google service account credentials are required for Google STT flows.
- Additional credentials can also be managed from the in-app settings UI.

## Development Commands

| Command | Purpose |
|---|---|
| npm run dev | Start Vite renderer dev server |
| npm run electron:dev | Build Electron process and run Electron in development mode |
| npm run app:dev | Run renderer + Electron together (recommended local workflow) |
| npm run start | Alias for app:dev |
| npm run build | Build renderer + TypeScript artifacts |
| npm run build:electron | Fast Electron TS transpile (esbuild) |
| npm run build:electron:tsc | Compile Electron with TypeScript compiler |
| npm run typecheck:electron | Type-check Electron sources |
| npm run build:native | Build Rust napi native module |
| npm run app:build | Full production build + package via electron-builder |
| npm run dist | Alias for app:build |
| npm run preview | Preview Vite build output |
| npm run clean | Remove dist and dist-electron |

## Build and Packaging

- Output artifacts are produced by electron-builder.
- Configured targets include:
  - macOS: zip, dmg (x64 + arm64)
  - Windows: nsis, portable
  - Linux: AppImage, deb
- Build outputs are written to the release directory.

## Data, Privacy, and Storage

- Meeting metadata/transcripts are persisted locally in the app data store.
- Vector embeddings and retrieval indices are generated for RAG features.
- Local model assets are downloaded to resources/models.
- API credentials are managed through app credential flows and secure storage integrations where available.

## Troubleshooting

### Native module build failures

- Ensure Rust is installed and available in your shell.
- Ensure platform-specific C/C++ build tools are installed.
- Re-run:

```bash
npm run build:native
```

### Electron native dependency ABI issues

If you hit errors with native dependencies after Electron upgrades, run:

```bash
npm run ensure:electron-native
```

### Missing local models / embedding errors

Re-download local models:

```bash
node scripts/download-models.js
```

## License

This project is licensed under the GNU Affero General Public License v3.0.
See the LICENSE file for full terms.
