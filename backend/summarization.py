import os
from dotenv import load_dotenv
from google import genai

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def summarize_transcript(transcript):

    prompt = f"""
Analyze the following meeting transcript.

Return the result in exactly these three sections:

SUMMARY:
Write a concise summary of the meeting in 1-2 paragraphs.

KEY DECISIONS:
List only the decisions that were actually made or agreed upon in the meeting.
Write each decision on a separate line starting with "-".

TASKS TO COMPLETE:
List only the tasks, responsibilities, or action items that need to be completed.
Write each task on a separate line starting with "-".
Do not invent tasks that are not mentioned or implied by the meeting.

Meeting Transcript:

{transcript}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text