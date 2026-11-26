// Mathy Travels: search, results and booking

const searchForm = document.getElementById("search-form");
const resultsMessage = document.getElementById("results-message");
const resultsList = document.getElementById("results-list");
const cardTemplate = document.getElementById("flight-card-template");
const resultsSection = document.getElementById("results");
const routeButtons = document.querySelectorAll(".route-card");
const originInput = document.getElementById("origin");
const destinationInput = document.getElementById("destination");
const dateInput = document.getElementById("date");
const sortSelect = document.getElementById("sort-by");
const stopsSelect = document.getElementById("filter-stops");
const airlineSelect = document.getElementById("filter-airline");
const searchInput = document.getElementById("search-results");
const searchButton = document.querySelector(".search-button");
const searchButtonText = document.querySelector(".search-button-text");

// The full list from the last search, and how many adults it was for
let searchCabin = "Ecomony";
let allFlights = [];
let searchAdults = 1;

// The whatsApp number that receives booking requests: country code and number, no + or spaces
const WHATSAPP_NUMBER = "211928934830";

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

// "1 adult" or "2 adults"
function formatAdults(adults) {
  if (adults === 1) {
    return "1 adult";
  }
  return adults + " adults";
}

// Build a whatsApp link with a ready-made booking request for one flight
function whatsappLink(flight) {
  const message =
    "Hello Mathy Travels, I would like to book this flight:\n" +
    flight.airline +
    " " +
    flight.flight_numbers +
    "\n" +
    flight.origin +
    " to " +
    flight.destination +
    " on " +
    flight.departing_at.slice(0, 10) +
    "\n" +
    "Departs " +
    formatTime(flight.departing_at) +
    ", arrives " +
    formatTime(flight.arriving_at) +
    "\n" +
    "Travellers: " +
    formatAdults(searchAdults) +
    ", " +
    searchCabin +
    "\n" +
    "Price shown: " +
    formatPrice(flight.price, flight.currency) +
    "\n" +
    "Offer reference: " +
    flight.id +
    "\n" +
    "Please confirm availability and the final price.";

  return (
    "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message)
  );
}

// Turn 1522.9 into "USD 1,552.90"
function formatPrice(price, currency) {
  const amount = price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency + " " + amount;
}

// Show that a search is running, or put the button back to normal
function setSearching(isSearching) {
  searchButton.disabled = isSearching;

  if (isSearching) {
    searchButtonText.textContent = "Searching...";
  } else {
    searchButtonText.textContent = "Search flights";
  }
}

// Give a date some days from today, in the format the date box uses, like "2026-12-02"
function dateInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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
  card.querySelector(".flight-number").textContent = flight.flight_numbers;
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
  card.querySelector(".book-link").href = whatsappLink(flight);

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

// Fill the airlines dropdown with the airlines found in this search
function fillAirlineOptions(flights) {
  airlineSelect.innerHTML = '<option value="all">All airlines</option>';

  const airlineNames = [];
  for (const flight of flights) {
    if (!airlineNames.includes(flight.airline)) {
      airlineNames.push(flight.airline);
    }
  }
  airlineNames.sort();

  for (const name of airlineNames) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    airlineSelect.appendChild(option);
  }
}

// Check one flight against the stops, airline and search box choices
function matchesFilters(flight) {
  if (stopsSelect.value === "direct" && flight.stops > 0) {
    return false;
  }

  if (airlineSelect.value !== "all" && flight.airline !== airlineSelect.value) {
    return false;
  }

  const searchText = searchInput.value.trim().toLowerCase();
  if (searchText !== "") {
    const airline = flight.airline.toLowerCase();
    const numbers = flight.flight_numbers.toLowerCase();

    if (!airline.includes(searchText) && !numbers.includes(searchText)) {
      return false;
    }
  }

  return true;
}

// Put a list of flights in the order the visitor chose
function sortFlights(flights, sortBy) {
  if (sortBy === "cheapest") {
    flights.sort(function (a, b) {
      return a.price - b.price;
    });
  } else if (sortBy === "fastest") {
    flights.sort(function (a, b) {
      return a.duration_minutes - b.duration_minutes;
    });
  } else if (sortBy === "earliest") {
    flights.sort(function (a, b) {
      return a.departing_at.localeCompare(b.departing_at);
    });
  } else if (sortBy === "latest") {
    flights.sort(function (a, b) {
      return b.departing_at.localeCompare(a.departing_at);
    });
  }
}

//apply the filters and sort, then show the matching flights with a short message
function updateResults() {
  const matching = [];
  for (const flight of allFlights) {
    if (matchesFilters(flight)) {
      matching.push(flight);
    }
  }

  sortFlights(matching, sortSelect.value);

  if (allFlights.length === 0) {
    resultsMessage.textContent =
      "No flights found for this route and date. Try another date.";
  } else if (matching.length === 0) {
    resultsMessage.textContent =
      "No flights match these filters. Try clearing the search or choosing any number of stops.";
  } else if (matching.length === allFlights.length) {
    resultsMessage.textContent = allFlights.length + " flights found";
  } else {
    resultsMessage.textContent =
      " Showing " + matching.length + " of " + allFlights.length + " flights";
  }

  showFlights(matching, searchAdults);
}

// When the visitor presses "Search flights", search without reloading the page
searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(searchForm);
  const searchDetails = new URLSearchParams(formData);

  resultsSection.hidden = false;
  resultsSection.scrollIntoView();
  resultsMessage.textContent = "Searching for flights...";

  resultsList.innerHTML = "";
  setSearching(true);

  let data;
  try {
    const response = await fetch("/api/search?" + searchDetails.toString());
    data = await response.json();
  } catch (error) {
    setSearching(false);
    resultsMessage.textContent =
      "We could not connect. Check your internet connection and try again.";
    return;
  }

  setSearching(false);

  if (data.error) {
    resultsList.innerHTML = "";
    resultsMessage.textContent = data.error;
    return;
  }

  allFlights = data.flights;
  searchAdults = Number(formData.get("adults"));
  searchInput.value = "";
  searchCabin = document.getElementById("cabin").selectedOptions[0].textContent;

  fillAirlineOptions(allFlights);
  updateResults();
});

// Clicking a popular route fills in the form and searches straight away
for (const button of routeButtons) {
  button.addEventListener("click", function () {
    originInput.value = "JUB";
    destinationInput.value = button.dataset.destination;

    if (dateInput.value === "") {
      dateInput.value = dateInDays(7);
    }

    searchForm.requestSubmit();
  });
}

// Update the cards whenever a sort, filter or search choice changes
sortSelect.addEventListener("change", updateResults);
stopsSelect.addEventListener("change", updateResults);
airlineSelect.addEventListener("change", updateResults);
searchInput.addEventListener("input", updateResults);

// Only allow dates from tomorrow onwards in the calendar
dateInput.min = dateInDays(1);
