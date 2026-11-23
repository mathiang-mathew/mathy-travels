import os

import requests
from dotenv import load_dotenv
from flask import Flask

# Read the values in .env so the app can use them
load_dotenv()

DUFFEL_TOKEN = os.getenv("DUFFEL_TOKEN")
DUFFEL_URL = "https://api.duffel.com"
app = Flask(__name__)

# Ask Duffel for flights on one route and date, and return its answer


def search_flights(origin, destination, date):
    headers = {
        "Authorization": f"Bearer {DUFFEL_TOKEN}",
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    body = {
        "data": {
            "slices": [
                {
                    "origin": origin,
                    "destination": destination,
                    "departure_date": date,
                }
            ],
            "passengers": [{"type": "adult"}],
            "cabin_class": "economy",
        }
    }

    url = DUFFEL_URL + "/air/offer_requests"
    response = requests.post(url, json=body, headers=headers, timeout=30)
    return response.json()


@app.route("/")
def home():
    return "Mathy Travels is running"

# A small check that tells us the server is up and answering


@app.route("/api/health")
def health():
    return {"status": "ok"}

# Temporary route to see what Duffel sends back


@app.route("/api/test-search")
def test_search():
    return search_flights("JUB", "NBO", "2026-12-10")


if __name__ == "__main__":
    if not DUFFEL_TOKEN:
        print("Warning: DUFFEL_TOKEN is missing from the .env file")

    port = int(os.getenv("PORT", 8000))
    app.run(port=port, debug=True)
