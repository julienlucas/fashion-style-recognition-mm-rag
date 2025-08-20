# Fashion Style Finder RAG

AI system to analyze fashion and recommend clothing.

## LangSmith Configuration

To monitor your application with LangSmith:

1. **Create a LangSmith account**: Go to [smith.langchain.com](https://smith.langchain.com)

2. **Get your API key**: In your account settings

3. **Create a `.env` file** in the root directory:
```bash
# LangSmith Configuration
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=fashion_style_analyzer

# Mistral AI Configuration
MISTRALAI_API_KEY=your_mistral_api_key_here
```

4. **Install dependencies**:
```bash
poetry install
```

5. **Launch the application**:
```bash
python manage.py runserver
```

## Features

- Fashion image analysis with AI
- Similarity search in a database
- Detailed description generation
- Monitoring with LangSmith to trace LLM calls
- Modern web interface with React

## Structure

- `backend/`: Django API with image processing and LLM
- `frontend/`: React interface with drag & drop
- `static/`: Test images and resources
