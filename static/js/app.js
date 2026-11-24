// Mathy Travels: search, results and booking

const searchForm = document.getElementById("search-form");
const resultsMessage = document.getElementById("results-message");
const resultsList = document.getElementById("results-list");

// When the visitor presses "Search flights", search without reloading the page
searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(searchForm);
  const searchDetails = new URLSearchParams(formData);

  resultsMessage.textContent = "Searching for flights...";

  const response = await fetch("/api/search?" + searchDetails.toString());
  const data = await response.json();

  console.log(data);
});
