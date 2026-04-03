# AI Content Text

English | [简体中文](./README_zh.md)

A three-stage AI content creation pipeline tool that helps you generate high-quality content step by step from outline to finished product.

## ✨ Features

- 🚀 **Three-stage pipeline creation**: Generate content step by step from outline to detailed draft to final polished work
- 🎨 **Flexible regeneration**: Support independent regeneration for each stage, keep the results you like and rework what you're not satisfied with
- 🔌 **Dual model support**: Seamlessly switch between local Ollama models and online API models
- ⚡ **Pure frontend implementation**: All configuration and history are saved locally, no backend service required
- ⌨️ **Keyboard shortcuts**: `⌘/Ctrl + Enter` to quickly start generation
- 📔 **History management**: Automatically saves all creation history, supports viewing and management at any time
- 🎯 **Customizable configuration**: Different models can be configured for different stages to get the best results
- 📝 **Support for multiple content types**: Suitable for both article and novel creation

## 🖥️ Screenshot

![Screenshot](./screenshot.png)

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm/yarn/pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/lanqiang101/ai-content-txt.git
cd ai-content-txt

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open your browser and visit `http://localhost:5173` to use the application.

### Build

```bash
# Build for production
npm run build
```

The built files will be in the `dist` directory.

## 🎯 Usage

1. **Configure Model**: Click the settings icon in the bottom right corner to configure your AI model. You can set different models for each of the three stages.
   - Local mode: Use with Ollama, fill in your local Ollama address and model name
   - API mode: Use with OpenAI compatible API, fill in API address, model name and API key

2. **Input Information**: Select content type (article/novel), enter topic, keywords, expected word count and style requirements.

3. **Start Generation**: Click "Start Generation" or use `⌘/Ctrl + Enter` shortcut. The application will automatically complete three stages of generation:
   - Stage 1: Generate content outline
   - Stage 2: Expand into detailed content based on outline
   - Stage 3: Polish and optimize into final finished content

4. **Regenerate if Needed**: If you're not satisfied with a particular stage's result, you can click the regenerate button for that stage to regenerate while keeping other stages' results.

5. **View History**: Click the history icon in the top left corner to view all your previous creations.

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Lucide React (icons)

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Issues and Pull Requests are welcome!
