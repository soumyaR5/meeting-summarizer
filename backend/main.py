from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import shutil


from transcription import transcribe_audio
from summarization import summarize_transcript


load_dotenv()


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


UPLOAD_FOLDER = "../uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "Meeting Summarizer API is running"
    }


@app.post("/summarize")
async def summarize_meeting(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    transcript = transcribe_audio(file_path)

    summary_result = summarize_transcript(transcript)

    #action_items = ""

    #if "### 3. Action Items" in summary:
    #   action_items = summary.split("### 3. Action Items", 1)[1].strip()

    summary_result = summarize_transcript(transcript)

    return {
        "transcript": transcript,
        "summary": summary_result
    }