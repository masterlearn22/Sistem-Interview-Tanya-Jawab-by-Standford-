AI Agent Instruction: Implementation Plan for "Sistem Interview Tanya Jawab"

1. Project Overview

You are tasked with building a full-stack web application for an NLP Extractive Question Answering system. The machine learning model (DistilBERT fine-tuned on SQuAD) has already been trained and downloaded locally. Your job is to build the Backend API to serve this model and the Frontend UI to interact with it.

2. Tech Stack

Backend: Python, FastAPI, Uvicorn, Pydantic, Hugging Face transformers, torch.

Frontend: HTML5, CSS3, Vanilla JavaScript (or React/Vue if preferred by the user's environment).

AI Model: Pre-trained Hugging Face pipeline (question-answering).

3. Directory Structure

Please create and organize the project using the following structure:

qa_interview_project/
├── backend/
│   ├── main.py                  # FastAPI server application
│   ├── requirements.txt         # Python dependencies
│   └── sistem-interview-final/  # (PROVIDED) The trained model folder containing config.json, model.safetensors, etc.
└── frontend/
    ├── index.html               # Main UI
    ├── style.css                # Styling (Modern, Clean UI)
    └── app.js                   # Logic for API calls and DOM manipulation


4. Phase 1: Backend Implementation (FastAPI)

Task: Create a REST API in backend/main.py that loads the model and processes requests.

Dependencies: Define fastapi, uvicorn, transformers, torch, pydantic in requirements.txt.

CORS Configuration: Strictly configure CORSMiddleware to allow all origins (allow_origins=["*"]) for local development to prevent frontend fetch blocking.

Model Initialization: Load the question-answering pipeline using transformers at the global level / app startup event. DO NOT load the model inside the request endpoint (it will cause memory leaks and slow responses). Path to model: ./sistem-interview-final.

Data Models (Pydantic):

Request: { "context": "string", "question": "string" }

Response: { "answer": "string", "score": float, "start_index": int, "end_index": int }

Endpoint: Create a POST endpoint at /api/ask that takes the Request model, passes it to the QA pipeline, and returns the Response model.

Error Handling: Implement try-except blocks. Return HTTP 500 if the model fails to predict or if the context/question is empty.

5. Phase 2: Frontend Implementation

Task: Build a clean, professional, and responsive UI simulating an Interview Dashboard.

Language: Indonesian (Bahasa Indonesia).

Layout Elements:

Header / Title: "Simulasi Sistem Interview Tanya Jawab".

Textarea for "Konteks (Profil / CV Kandidat)" (Provide a default mock context).

Text input for "Pertanyaan Interview".

Submit Button: "Cari Jawaban".

Loading indicator (Spinner or text).

Result Container: Display the Extracted Answer and the Confidence Score (convert the float score to a percentage format, e.g., 95.5%).

JavaScript Logic:

Add an event listener to the Submit button.

Show loading state, disable button.

Perform a fetch POST request to http://127.0.0.1:8000/api/ask.

Parse the JSON response and update the Result Container.

Handle network errors gracefully (display an error banner to the user).

6. Execution Steps for AI Agent

Initialize the project directory.

Instruct the user to place their trained model folder inside the backend/ directory and rename it to sistem-interview-final.

Generate requirements.txt and main.py.

Generate the frontend files (index.html, style.css, app.js).

Provide the exact terminal commands to start the FastAPI server (uvicorn main:app --reload) and instruct how to open the frontend file.