// Mathy Travels: search, results and booking

const searchForm = document.getElementById("search-form");
const resultsMessage = document.getElementById("results-message");
const resultsList = document.getElementById("results-list");
const cardTemplate = document.getElementById("flight-card-template");
const resultsSection = document.getElementById("results");

// Turn "2026-11-27T20:07:00" into "20:07"
function formatTime(dateText) {
  return dateText.slice(11, 16);
}

// Describe the number of stops in plain words
function formatStops(stops) {
  if (stops === 0) {
    return "Direct";
  }
  if (stops === 1) {
    return "1 stop";
  }
  return stops + " stops";
}

// Turn 1522.9 into "USD 1,552.90"
function formatPrice(price, currency) {
  const amount = price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency + " " + amount;
}

// Copy the blank card and fill in one flight's detials
function createFlightCard(flight, adults) {
  const card = cardTemplate.content.cloneNode(true);

  const logo = card.querySelector(".airline-logo");
  if (flight.logo) {
    logo.src = flight.logo;
  } else {
    logo.remove();
  }

  card.querySelector(".airline-name").textContent = flight.airline;
  card.querySelector(".departure-time").textContent = formatTime(
    flight.departing_at,
  );
  card.querySelector(".origin-code").textContent = flight.origin;
  card.querySelector(".flight-duration").textContent = flight.duration_text;
  card.querySelector(".flight-stops").textContent = formatStops(flight.stops);
  card.querySelector(".arrival-time").textContent = formatTime(
    flight.arriving_at,
  );

  // Show "+1" (or more) when the flight lands on a later day than it leaves
  const departureDay = new Date(flight.departing_at.slice(0, 10));
  const arrivalDay = new Date(flight.arriving_at.slice(0, 10));
  const daysLater = (arrivalDay - departureDay) / 86400000;

  if (daysLater > 0) {
    card.querySelector(".arrival-time").textContent =
      formatTime(flight.arriving_at) + " +" + daysLater;
  }

  card.querySelector(".destination-code").textContent = flight.destination;
  card.querySelector(".price-amount").textContent = formatPrice(
    flight.price,
    flight.currency,
  );

  if (adults === 1) {
    card.querySelector(".price-note").textContent = "total for 1 adult";
  } else {
    card.querySelector(".price-note").textContent =
      "total for " + adults + " adults";
  }

  return card;
}

// Clear old results and show a card for each flight
function showFlights(flights, adults) {
  resultsList.innerHTML = "";

  for (const flight of flights) {
    const card = createFlightCard(flight, adults);
    resultsList.appendChild(card);
  }
}

// When the visitor presses "Search flights", search without reloading the page
searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(searchForm);
  const searchDetails = new URLSearchParams(formData);

  resultsSection.hidden = false;
  resultsMessage.textContent = "Searching for flights...";

  const response = await fetch("/api/search?" + searchDetails.toString());
  const data = await response.json();

  if (data.error) {
    resultsList.innerHTML = "";
    resultsMessage.textContent = data.error;
    return;
  }

  const adults = Number(formData.get("adults"));

  if (data.flights.length === 1) {
    resultsMessage.textContent = "1 flight found";
  } else {
    resultsMessage.textContent = data.flights.length + " flights found";
  }

  showFlights(data.flights, adults);
});
