from dotenv import load_dotenv
load_dotenv()
import os
from google import genai

c = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
print("Available models:")
for m in c.models.list():
    if "generate" in str(m.supported_actions):
        print(" -", m.name)
