const apiKey = "b0829b68c6ec36dadda4020504f09326";
const lsKey = "weatherSearches";
const searchesDiv = $("#searches");
const searchInput = $("#searchInput");
const searchButton = $("searchBtn");
const currentWeatherDiv = $("#currentWeather");
const forecastDiv = $("#forecast");
const clearBtn = $("#clear");
// Do not plan to reassign
var storedSearches = getStoredSearches();
var addedCity = newCity();
// --------------------------------------
const metricUnits = { deg: "C", speed: "KPH" };
const impUnits = { deg: "F", speed: "MPH" };
// Do not plan to reassign --------------
var units = metricUnits;

// Initial function of the application

function init() {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });
}
