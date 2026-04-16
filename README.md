# AI Content Text

English | [简体中文](./README_zh.md)

A powerful AI-powered novel and content creation tool with multi-stage generation, batch automation, memory management, and comprehensive work management capabilities.

## ✨ Features

### 🎯 Core Creation Features
- 🚀 **Three-stage pipeline creation**: Generate novels step by step from outline to detailed draft to final polished work
- 📝 **Multi-content type support**: Supports both article and novel creation with specialized parameters
- 🎨 **Flexible regeneration**: Support independent regeneration for each stage, keep the results you like and rework what you're not satisfied with
- 🔄 **Batch automation**: Automatically generate multiple works continuously with customizable themes and intervals
- ⏱️ **Timer-based automation**: Schedule batch creation tasks with configurable time intervals

### 🧠 Advanced Memory System
- 💾 **Vector-based memory retrieval**: Uses Xenova/all-MiniLM-L6-v2 embedding model for intelligent context retrieval
- 📚 **Multi-type memory management**: Character profiles, plot points, foreshadowing, and chapter summaries
- 🔍 **Smart context injection**: Automatically retrieves and injects relevant memories before generation
- 🗜️ **Memory compression**: Intelligent deduplication and merging of similar memory entries
- 📊 **Priority weighting**: Different memory types have different weights (Character > Plot > Foreshadowing > Chapter)

### 📋 Work Management
- 📁 **Comprehensive work library**: Manage all created works with pagination and filtering
- 📊 **Real-time progress tracking**: Monitor generation progress across all active tasks
- ⏸️ **Task control**: Start, pause, resume, and cancel generation tasks at any time
- 📖 **Chapter editor**: Built-in editor for viewing and editing generated chapters
- 🎬 **Storyboard generation**: Convert text chapters into video storyboards
- 🔍 **Search and filter**: Search works by title, topic, or status

### 🔌 Model Integration
- 🤖 **Dual model support**: Seamlessly switch between local Ollama models and online API models
- 🎛️ **Per-stage model configuration**: Configure different models for outline, expansion, and polishing stages
- 🔥 **Volcengine Ark integration**: Native support for Volcengine's Doubao models
- ⚙️ **Customizable parameters**: Temperature, top_p, max_tokens, and timeout settings

### 💻 User Experience
- ⌨️ **Keyboard shortcuts**: `⌘/Ctrl + Enter` to quickly start generation
- 📔 **History management**: Automatically saves all creation history with timestamps
- 🎯 **Customizable configuration**: Comprehensive settings for reader profile, character design, plot structure, rhythm, details, emotions, and anti-AI detection
- 🌐 **Responsive design**: Works seamlessly on desktop and mobile devices
- 🌓 **Dark mode support**: Toggle between light and dark themes
- 🔔 **Browser notifications**: Get notified when long-running tasks complete
- 🎲 **Random inspiration**: One-click random generation for keywords, styles, and configurations

## 🖥️ Screenshot

![Screenshot](./screenshot.png)

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm/yarn/pnpm package manager
- Backend server running (for database and memory management features)

### Installation

```bash
# Clone the repository
git clone https://github.com/lanqiang101/ai-content-txt.git
cd ai-content-txt

# Install dependencies
npm install
```

### Backend Setup

The project includes a backend server for database management and memory system:

```bash
# Navigate to server directory
cd server

# Install server dependencies
npm install

# Start the backend server
node index.js
```

The backend will run on `http://localhost:3000` by default.

### Frontend Development

```bash
# In the root directory, start development server
npm run dev
```

Open your browser and visit `http://localhost:5173` to use the application.

### Build

```bash
# Build for production
npm run build
```

The built files will be in the `dist` directory.

## 🎯 Usage Guide

### 1. Initial Configuration

Click the settings icon in the bottom right corner to configure:
- **Model Settings**: Set up API endpoints, keys, and model names for each stage
- **System Configuration**: Configure popular topics, continuation settings, and optimization preferences
- **Memory Settings**: Enable/disable vector embeddings and configure retrieval parameters

### 2. Single Work Creation

**Step 1: Input Basic Information**
- Select content type (Article/Novel)
- Enter topic, keywords, expected word count
- Choose writing style and tone

**Step 2: Configure Novel Parameters** (for novels only)
- **Reader Profile**: Target audience age, gender preference, core appeal
- **Character Design**: Protagonist traits, flaws, growth arcs
- **Plot Structure**: Story arc type, conflict intensity, pacing
- **Rhythm Control**: Scene transitions, tension curves
- **Detail Level**: Description density, dialogue ratio
- **Emotional Tone**: Overall mood and emotional progression
- **Anti-AI Detection**: Techniques to make text more human-like

**Step 3: Start Generation**
- Click "Start Creation" to begin the three-stage process
- Monitor real-time progress in the output panels
- Task runs in background - you can navigate away and return later

**Step 4: Review and Refine**
- View generated content in stage-specific panels
- Regenerate individual stages if needed
- Edit chapters directly in the work detail page

### 3. Batch Automation

**Setup Batch Themes**
- Add multiple topics/themes for batch generation
- Configure common parameters for all works
- Set total number of works to generate

**Configure Automation**
- Set time interval between works (e.g., 5 minutes)
- Enable/disable automatic continuation
- Configure notification preferences

**Start Batch Process**
- Click "Start Batch Automation"
- Monitor progress in the automation panel
- All works are saved to the work library automatically

### 4. Work Management

**View All Works**
- Navigate to "Work Library" page
- Filter by status (Draft/Generating/Completed/Failed)
- Search by title or topic
- Paginated view for large libraries

**Manage Tasks**
- View all running tasks with real-time progress
- Cancel or pause ongoing generations
- Resume interrupted tasks
- View detailed statistics (total words, chapters, etc.)

**Edit and Continue**
- Open any work to view full content
- Edit chapters individually
- Use AI to continue or optimize specific chapters
- Generate video storyboards from text

### 5. Memory Management

**Access Memory Manager**
- Navigate to "Memory Manager" page
- View all stored memories organized by type

**Memory Types**
- **Characters**: Detailed character profiles with traits and relationships
- **Plots**: Key plot points and story developments
- **Foreshadowing**: Planted clues and future revelations
- **Chapters**: Chapter summaries and key events

**Memory Operations**
- Search memories by relevance
- Manually add/edit/delete memories
- Compress redundant entries
- Export/import memory databases

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand with persist middleware
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Routing**: React Router 6
- **Database Client**: Better-SQLite3 (via backend API)

### Backend Stack
- **Runtime**: Node.js with Express
- **Database**: SQLite with Better-SQLite3
- **Vector Embeddings**: Xenova Transformers.js
- **API**: RESTful endpoints for works, memories, and configurations

### Data Flow
```
User Input → Store (Zustand) → Backend API → SQLite Database
                                    ↓
                            Memory Manager → Vector DB
                                    ↓
                            AI Model API → Generated Content
                                    ↓
                            Store Update → UI Refresh
```

### Key Components

**State Management**
- `useStore`: Central store for config, params, generation state, works
- `persist`: Selective persistence (config only, not runtime state)
- `currentWorkId`: Tracks active generation task

**Generation Pipeline**
- `useCycleGeneration`: Multi-stage generation logic with abort support
- `useModelCall`: Model API communication with error handling
- `usePromptBuilder`: Dynamic prompt construction with memory injection

**Memory System**
- `NovelMemoryManager`: Server-side memory orchestration
- `useMemory`: Client-side memory operations
- Vector similarity search with type-based weighting

## 🛠️ Tech Stack

### Frontend
- React 18.2+
- TypeScript 5.2+
- Vite 5.0+
- Tailwind CSS 3.3+
- Zustand 4.4+
- React Router 6
- Lucide React 0.294+

### Backend
- Node.js
- Express 4
- Better-SQLite3
- @xenova/transformers (embeddings)
- CORS, body-parser middleware

### Development Tools
- ESLint 8.55+
- PostCSS 8.4+
- Autoprefixer

## 📂 Project Structure

```
ai-content-txt/
├── src/                      # Frontend source
│   ├── components/           # React components
│   │   ├── ConfigPanel/      # Configuration UI
│   │   ├── WorksPanel/       # Work management
│   │   ├── WorkDetail/       # Work detail & editor
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useGeneration.ts
│   │   ├── useCycleGeneration.ts
│   │   ├── useMemory.ts
│   │   └── ...
│   ├── pages/                # Route pages
│   │   ├── WorksListPage.tsx
│   │   ├── WorkDetailPage.tsx
│   │   ├── MemoryManagerPage.tsx
│   │   └── ...
│   ├── store/                # Zustand store
│   │   └── useStore.ts
│   ├── services/             # API services
│   │   └── db.ts
│   └── types/                # TypeScript types
│       └── index.ts
├── server/                   # Backend server
│   ├── routes/               # API routes
│   │   ├── works.js
│   │   ├── novel-memory.js
│   │   └── ...
│   ├── utils/                # Utilities
│   │   └── memory-manager.js
│   └── index.js              # Server entry
├── models/                   # ML models
│   └── embedding/            # Embedding models
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend server port
PORT=3000

# Database path
DB_PATH=./database.sqlite

# Node environment
NODE_ENV=development
```

### Model Configuration

**Local Ollama Example:**
```json
{
  "mode": "local",
  "provider": "ollama",
  "localUrl": "http://localhost:11434",
  "model": "qwen2.5:7b"
}
```

**Volcengine Ark Example:**
```json
{
  "mode": "api",
  "provider": "volcengine",
  "apiUrl": "https://ark.cn-beijing.volces.com/api/v3",
  "model": "doubao-pro-32k",
  "apiKey": "your-api-key"
}
```

## 🎓 Advanced Features

### Memory Retrieval Strategy

The system uses a sophisticated memory retrieval strategy:

1. **Query Construction**: Based on current chapter context and previous content
2. **Type-Based Weighting**: Characters (1.5x) > Plots (1.2x) > Foreshadowing (1.0x) > Chapters (0.8x)
3. **Similarity Threshold**: Only returns memories with cosine similarity > 0.7
4. **Top-K Selection**: Retrieves top 5 most relevant memories per type
5. **Context Injection**: Formats memories into natural language prompts

### Task Management

**Background Execution:**
- Tasks continue running even when you navigate away
- State is tracked via `currentWorkId` in global store
- Progress is persisted to database every 30 seconds
- Browser notifications on completion

**Multi-Task Support:**
- Create multiple tasks without waiting for completion
- Each task has independent AbortController
- View all tasks in Work Library
- Individual task control (cancel/resume)

### Prompt Engineering

The system uses advanced prompt engineering techniques:

- **Stage-Specific Prompts**: Customized prompts for outline, expansion, and polishing
- **Memory-Augmented Generation**: Injects relevant memories into context
- **Anti-Detection Patterns**: Techniques to reduce AI-generated text patterns
- **Style Consistency**: Maintains consistent voice across chapters
- **Length Control**: Dynamic word count targets per cycle

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Volcengine Ark** for providing powerful AI models
- **Ollama** for local model serving
- **Xenova** for transformer.js embedding models
- **Tailwind CSS** for utility-first CSS framework
- **Zustand** for simple state management

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

---

Made with ❤️ by the AI Content Text Team
