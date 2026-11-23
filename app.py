import os

import requests
from dotenv import load_dotenv
from flask import Flask, request

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

# Turn Duffel's duration code like "PT6H25M" into a number of minutes


def duration_in_minutes(duration):
    total = 0
    number = ""

    for character in duration:
        if character.isdigit():
            number = number + character
        elif character == "D":
            total = total + int(number) * 24 * 60
            number = ""
        elif character == "H":
            total = total + int(number) * 60
            number = ""
        elif character == "M":
            total = total + int(number)
            number = ""
    return total

# Turn a number of minutes into a label people can read, like "6h 25m"


def format_duration(minutes):
    hours = minutes // 60
    leftover_minutes = minutes % 60
    return f"{hours}h {leftover_minutes}m"

# Pick out the few details the results page needs from one Duffel offer


def simplify_offer(offer):
    journey = offer["slices"][0]
    segments = journey["segments"]
    first_flight = segments[0]
    last_flight = segments[-1]
    minutes = duration_in_minutes(journey["duration"])

    return {
        "id": offer["id"],
        "airline": offer["owner"]["name"],
        "logo": offer["owner"]["logo_symbol_url"],
        "price": float(offer["total_amount"]),
        "currency": offer["total_currency"],
        "origin": first_flight["origin"]["iata_code"],
        "destination": last_flight["destination"]["iata_code"],
        "departing_at": first_flight["departing_at"],
        "arriving_at": last_flight["arriving_at"],
        "stops": len(segments) - 1,
        "duration_minutes": minutes,
        "duration_text": format_duration(minutes),
    }


@app.route("/")
def home():
    return "Mathy Travels is running"

# A small check that tells us the server is up and answering


@app.route("/api/health")
def health():
    return {"status": "ok"}

# Search flights using the details the visitor sends in the address


@app.route("/api/search")
def search():
    origin = request.args.get("origin", "").strip().upper()
    destination = request.args.get("destination", "").strip().upper()
    date = request.args.get("date", "").strip()

    if not origin or not destination or not date:
        message = "Choose where you are flying from, where to, and a date."
        return {"error": message}, 400

    try:
        result = search_flights(origin, destination, date)
    except requests.exceptions.RequestException:
        message = "We could not reach the airline system. Try again in a minute."
        return {"error": message}, 503
    if "errors" in result:
        message = result["errors"][0]["message"]
        return {"error": message}, 400

    flights = []
    for offer in result["data"]["offers"]:
        flights.append(simplify_offer(offer))

    return {"flights": flights}


if __name__ == "__main__":
    if not DUFFEL_TOKEN:
        print("Warning: DUFFEL_TOKEN is missing from the .env file")

    port = int(os.getenv("PORT", 8000))
    app.run(port=port, debug=True)
