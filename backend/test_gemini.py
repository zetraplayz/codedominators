from dotenv import load_dotenv
load_dotenv()
import os
from google import genai

key = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=key)

MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"]

for model in MODELS:
    try:
        resp = client.models.generate_content(model=model, contents="Reply with just: ok")
        print(f"SUCCESS with {model}: {(resp.text or '').strip()}")
        break
    except Exception as e:
        err = str(e)
        if "503" in err or "UNAVAILABLE" in err:
            print(f"OVERLOADED: {model}, trying next...")
        elif "404" in err or "NOT_FOUND" in err:
            print(f"NOT FOUND: {model}, trying next...")
        else:
            print(f"ERROR with {model}: {err[:150]}")
            break
