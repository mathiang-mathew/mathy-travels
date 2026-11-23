import os
from dotenv import load_dotenv
from flask import Flask
app = Flask(__name__)

# Read the values in .env so the app can use them
load_dotenv()

DUFFEL_TOKEN = os.getenv("DUFFEL_TOKEN")
app = Flask(__name__)


@app.route("/")
def home():
    return "Mathy Travels is running"
# A small check that tells us the server is up and running


@app.route("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    if not DUFFEL_TOKEN:
        print("Warning: DUFFEL_TOKEN is missing from the .env file")

    port = int(os.getenv("PORT", 8000))
    app.run(port=8000, debug=True)
