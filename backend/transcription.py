import os
import subprocess
import tempfile
from dotenv import load_dotenv
from groq import Groq
import shutil


# Find FFmpeg automatically from the system PATH
FFMPEG_PATH = shutil.which("ffmpeg")

if FFMPEG_PATH is None:
    raise RuntimeError(
        "FFmpeg is not installed or not available in the system PATH."
    )


load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".env"
    )
)

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


MAX_FILE_SIZE = 20 * 1024 * 1024

CHUNK_DURATION = 300


def transcribe_file(file_path):

    with open(file_path, "rb") as file:

        transcription = client.audio.transcriptions.create(
            file=file,
            model="whisper-large-v3-turbo",
            language="en",
            response_format="json",
            temperature=0
        )

    return transcription.text


def split_audio(file_path, output_directory):

    output_pattern = os.path.join(
        output_directory,
        "chunk_%03d.wav"
    )

    command = [
        FFMPEG_PATH,
        "-i",
        file_path,
        "-f",
        "segment",
        "-segment_time",
        str(CHUNK_DURATION),
        "-acodec",
        "pcm_s16le",
        output_pattern,
        "-y"
    ]

    subprocess.run(
        command,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    chunks = []

    for file_name in sorted(os.listdir(output_directory)):

        if (
            file_name.startswith("chunk_")
            and file_name.endswith(".wav")
        ):

            chunks.append(
                os.path.join(
                    output_directory,
                    file_name
                )
            )

    return chunks


def transcribe_audio(file_path):

    file_size = os.path.getsize(file_path)

    if file_size <= MAX_FILE_SIZE:
        return transcribe_file(file_path)

    print("Audio file is too large. Splitting into chunks...")

    with tempfile.TemporaryDirectory() as temp_directory:

        chunks = split_audio(
            file_path,
            temp_directory
        )

        transcripts = []

        for index, chunk in enumerate(chunks):

            print(
                f"Transcribing chunk "
                f"{index + 1}/{len(chunks)}..."
            )

            transcript = transcribe_file(chunk)

            transcripts.append(transcript)

        return "\n\n".join(transcripts)