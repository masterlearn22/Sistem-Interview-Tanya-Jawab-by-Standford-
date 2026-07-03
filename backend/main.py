from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
from deep_translator import GoogleTranslator

app = FastAPI(title="Sistem Interview Tanya Jawab API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load model and tokenizer globally without using pipeline
try:
    model_path = "./sistem-interview-final"
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForQuestionAnswering.from_pretrained(model_path)
    print("Model and Tokenizer loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    tokenizer = None

# Instantiate translators
translator_id_to_en = GoogleTranslator(source='id', target='en')
translator_en_to_id = GoogleTranslator(source='en', target='id')

# Pydantic models for request and response
class QARequest(BaseModel):
    context: str
    question: str

class QAResponse(BaseModel):
    answer: str
    score: float
    start_index: int
    end_index: int

@app.post("/api/ask", response_model=QAResponse)
async def ask_question(request: QARequest):
    if not request.context.strip() or not request.question.strip():
        raise HTTPException(status_code=400, detail="Context and question cannot be empty.")
    
    if model is None or tokenizer is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")

    try:
        # Translate input from Indonesian to English
        translated_context = translator_id_to_en.translate(request.context)
        translated_question = translator_id_to_en.translate(request.question)

        # Tokenize the input (using translated english text)
        inputs = tokenizer(
            translated_question, 
            translated_context, 
            return_tensors="pt", 
            truncation=True, 
            max_length=512
        )
        
        # Get prediction
        with torch.no_grad():
            outputs = model(**inputs)

        # Extract answer span
        answer_start_index = outputs.start_logits.argmax()
        answer_end_index = outputs.end_logits.argmax()

        # Decode answer
        predict_answer_tokens = inputs.input_ids[0, answer_start_index : answer_end_index + 1]
        raw_answer_en = tokenizer.decode(predict_answer_tokens, skip_special_tokens=True)
        
        # Translate the answer back to Indonesian
        final_answer = ""
        if raw_answer_en.strip():
            final_answer = translator_en_to_id.translate(raw_answer_en)
        else:
            final_answer = "(Tidak ditemukan jawaban yang cocok)"

        # Calculate confidence score
        start_probs = torch.nn.functional.softmax(outputs.start_logits, dim=-1)[0]
        end_probs = torch.nn.functional.softmax(outputs.end_logits, dim=-1)[0]
        score = (start_probs[answer_start_index] * end_probs[answer_end_index]).item()
        
        return QAResponse(
            answer=final_answer,
            score=score,
            start_index=answer_start_index.item(),
            end_index=answer_end_index.item()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing prediction: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Sistem Interview Tanya Jawab API is running."}
