from flask import Flask
app = Flask(__name__)


@app.route("/")
def home():
    return "Mathy Travels is running"
# A small check that tells us the server is up and running


@app.route("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(port=8000, debug=True)
