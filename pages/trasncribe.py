# transcribe.py
import sys
import openai
import dotenv

dotenv.load_dotenv()

openai.api_key = dotenv.get_key(dotenv_path=".env", key_to_get="OPENAI_API_KEY")

def transribe_audio(file_path):
    audio_file = open(file_path, "rb")
    return openai.Audio.transcribe("whisper-1", audio_file).text

if __name__ == "__main__":
    file_path = sys.argv[1]
    print(transribe_audio(file_path))
