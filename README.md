# Meeting Summarizer

## Demo Video
https://github.com/user-attachments/assets/407f3694-1e98-4033-87a5-aeeaaf3e4e8f


A web-based Meeting Summarizer that transcribes meeting audio and generates an action-oriented summary using speech-to-text and an LLM.

The application accepts a meeting audio file, converts and processes the audio when required, generates a transcript using Groq Whisper, and analyzes the transcript using Google Gemini to extract:

- Summarized Transcript
- Key Decisions
- Tasks to Complete / Action Items

---

## 1. Objective

The objective of this project is to automatically process meeting audio and convert it into useful textual information.

Instead of manually listening to an entire meeting, the application provides a summarized version of the discussion along with important decisions and tasks that need to be completed.

---

## 2. Features

### Audio Upload

Users can upload meeting audio files through the frontend.

Supported audio formats include:

- `.mp3`
- `.wav`
- `.m4a`
- `.ogg`

### Speech-to-Text

The uploaded audio is transcribed using the Groq API with the Whisper model.

### Large Audio File Processing

Large audio files can exceed the API request size limit.

To handle such files, the application:

1. Checks the audio file size.
2. Splits large audio files into smaller chunks using FFmpeg.
3. Transcribes each chunk separately.
4. Combines the individual transcripts into one transcript.

### Meeting Summarization

The complete transcript is passed to Google Gemini for analysis.

The model generates:

- A concise meeting summary
- Key decisions
- Tasks/action items

### Web Interface

The frontend allows the user to:

1. Select an audio file.
2. Upload the file.
3. Generate the meeting summary.
4. View the generated results in separate sections.

---

## 3. Application Workflow

```text
Meeting Audio
      |
      v
   Frontend
      |
      v
 FastAPI Backend
      |
      v
Check Audio File Size
      |
      +------------------------+
      |                        |
 Small File                Large File
      |                        |
      |                     FFmpeg
      |                        |
      |                  Split into Chunks
      |                        |
      +-----------+------------+
                  |
                  v
           Groq Whisper
                  |
                  v
              Transcript
                  |
                  v
              Gemini
                  |
                  v
     +------------+-------------+
     |            |             |
     v            v             v
 Summary    Key Decisions   Tasks to Complete
     |            |             |
     +------------+-------------+
                  |
                  v
              Frontend
