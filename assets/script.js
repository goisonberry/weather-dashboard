const APIKey = "b0829b68c6ec36dadda4020504f09326";
const lsKey = "weatherSearches";
const searchesDiv = $("#searches");
const searchInput = $("#searchInput");
const searchButton = $("#searchBtn");
const currentWeatherDiv = $("#currentWeather");
const forecastDiv = $("#forecast");
const clearBtn = $("#clear");
var storedSearches = getStoredSearches();
//variable used to store and determine if the city needs to be added to the search history
var addedCity = newCity();
//unit variables for future development of switching between unit systems.
const metricUnits = { deg: "C", speed: "KPH" };
// Will use imperial units for this code to be more relevant while using in the US.
const impUnits = { deg: "F", speed: "MPH" };
var units = impUnits;

// Build a function for the search field.
function init() {
  //enable tooltips
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

  buildSearchHistory();

  if (storedSearches != null) {
    getWeather(storedSearches[0]);
  }

  searchInput.on("keyup", function (event) {
    if (event.key === "Enter") {
      searchButtonClicked();
    }
  });

  searchButton.on("click", searchButtonClicked);
  clearBtn.on("click", clearSearches);
}

function buildSearchHistory() {
  searchesDiv.empty();

  if (storedSearches != null) {
    storedSearches.forEach((element) => {
      searchesDiv.append(
        $("<button>")
          .text(
            correctCase(element.city) + ", " + element.country.toUpperCase()
          )
          .addClass("btn btnCitySearch")
          .on("click", function () {
            getWeather(element);
          })
      );
    });
  }
}

// Function for what the search button will do when clicked.
function searchButtonClicked() {
  let cityVal = searchInput.val().trim();
  let city = newCity(cityVal, null);
  getWeather(city);
  //This will clear the value once the search is activated
  searchInput.val("");
}

// This will allow to pull and set current and forecast weather.
function getWeather(city) {
  addedCity = city;
  let queryURLCurrent = "";
  let queryURLForecast = "";

  if (city.country == null) {
    queryURLCurrent =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city.city +
      "&units=imperial&appid=" +
      APIKey;
    queryURLForecast =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      city.city +
      "&units=imperial&appid=" +
      APIKey;
  } else {
    queryURLCurrent =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city.city +
      "," +
      city.country +
      "&units=imperial&appid=" +
      APIKey;
    queryURLForecast =
      "https:////api.openweathermap.org/data/2.5/forecast?q=" +
      city.city +
      "," +
      city.country +
      "&units=imperial&appid=" +
      APIKey;
  }

  performAPIGETCall(queryURLCurrent, buildCurrentWeather);
  performAPIGETCall(queryURLForecast, buildForecastWeather);
}

// This will pull, set and display main weather card
function buildCurrentWeather(data) {
  //console.log(data);
  if (data != null) {
    console.log(units, impUnits, data.wind.speed);
    currentWeatherDiv.empty();
    currentWeatherDiv.append(
      $("<h3>").text(
        correctCase(data.name) + ", " + data.sys.country.toUpperCase()
      ),
      $("<h4>")
        .text(moment.unix(data.dt).format("dddd, MMM Do YYYY"))
        .append(
          $("<img>")
            .attr(
              "src",
              "https://openweathermap.org/img/wn/" +
                data.weather[0].icon +
                "@2x.png"
            )
            .addClass("currentWeatherImg")
            .attr("data-toggle", "tooltip")
            .attr("data-placement", "right")
            .attr("title", data.weather[0].description)
            .tooltip()
        ),
      $("<p>").text(
        "Temperature: " + Math.round(data.main.temp) + "°" + units.deg
      ),
      $("<p>").text("Humidity: " + data.main.humidity + "%"),
      $("<p>").text(
        "Wind Speed: " +
          Math.round(
            units === metricUnits ? data.wind.speed * 3.6 : data.wind.speed
          ) +
          " " +
          units.speed
      ),
      $("<p>").text("UV Index: ").append($("<div>").attr("id", "UVIndex"))
    );

    let UVqueryURL =
      "https://api.openweathermap.org/data/2.5/uvi?appid=" +
      APIKey +
      "&lat=" +
      data.coord.lat +
      "&lon=" +
      data.coord.lon;

    performAPIGETCall(UVqueryURL, buildUV);

    if (addedCity.country == null) {
      addedCity.country = data.sys.country;
      addedCity.city = data.name;
      addNewSearch(addedCity);
      addedCity = null;
    }
  } else {
    alert(
      "Something went wrong getting current weather data, please try again"
    );
  }
}

// This will build the UV Index and display on the main card
function buildUV(data) {
  if (data != null) {
    let UVIndex = data.value;
    let UVDiv = $("#UVIndex").attr("data-toggle", "tooltip");
    let severity = "";
    let UVbg = null;
    let textColor = null;
    let borderColor = null;

    //This will determine severity of UV Index for color coding
    if (UVIndex < 2) {
      UVbg = "green";
      textColor = "white";
      severity = "Low";
      borderColor = "rgb(16, 129, 16)";
    } else if (UVIndex < 6) {
      UVbg = "yellow";
      severity = "Moderate";
      borderColor = "rgb(245, 245, 56)";
    } else if (UVIndex < 8) {
      UVbg = "orange";
      severity = "High";
      borderColor = "rgb(255, 184, 51)";
    } else if (UVIndex < 11) {
      UVbg = "red";
      textColor = "white";
      severity = "Very high";
      borderColor = "rgb(255, 54, 54)";
    } else {
      UVbg = "violet";
      severity = "Extreme";
      borderColor = "rgb(236, 151, 236)";
    }
    UVDiv.attr("title", severity)
      .attr("data-placement", "right")
      .tooltip()
      .css("backgroundColor", UVbg)
      .css("borderColor", borderColor);

    if (textColor != null) {
      UVDiv.css("color", textColor);
    }
    UVDiv.text(UVIndex);
  } else {
    alert("Something went wrong getting UV data, please try again");
  }
}

// This will build the forecast elements for the next 5 days.
function buildForecastWeather(data) {
  if (data != null) {
    forecastDiv.empty();

    let dayCardContainer = $("<div>")
      .attr("id", "dayCardContainer")
      .addClass("row");

    forecastDiv.append($("<h3>").text("5-Day Forecast:"), dayCardContainer);
    dailyData = parseDailyData(data);

    dailyData.forEach((element) => {
      dayCardContainer.append(buildForecastCard(element));
    });
  } else {
    alert("Something went wrong getting forecast data, please try again");
  }
}

function parseDailyData(data) {
  let dailyData = [];

  for (var i = 5; i < data.list.length; i += 8) {
    let dataList = data.list[i];

    dailyData.push(
      newDay(
        dataList.dt,
        dataList.weather[0].icon,
        dataList.weather[0].description,
        dataList.main.temp,
        dataList.main.humidity
      )
    );
  }
  return dailyData;
}

// This will take the previous forecast function and help build the actual card that will display in the app
function buildForecastCard(day) {
  let dayCard = $("<div>").attr("class", "dayCard col-12 col-md-5 col-lg-2");

  dayCard.append(
    $("<label>").text(getDayOfWeek(day.date)),
    $("<label>").text(moment.unix(day.date).format("MMM Do YYYY")),
    $("<img>")
      .attr("src", "https://openweathermap.org/img/wn/" + day.icon + ".png")
      .attr("data-toggle", "tooltip")
      .attr("data-placement", "right")
      .attr("title", day.description)
      .tooltip(),
    $("<p>").text("Temperature: " + Math.round(day.temp) + "°" + units.deg),
    $("<p>").text("Humidity: " + day.humidity + "%")
  );

  return dayCard;
}

// This will allow for a new search to be done.
function addNewSearch(city) {
  //console.log(city, storedSearches);
  if (storedSearches == null) {
    storedSearches = [];
  }
  //put the newest city at the top
  storedSearches.unshift(city);

  localStorage.setItem(lsKey, JSON.stringify(storedSearches));

  buildSearchHistory();
}

function clearSearches() {
  localStorage.removeItem(lsKey);
  searchesDiv.empty();
  storedSearches = null;
}
init();

// Now this is where everything starts to happen.
function getDayOfWeek(date) {
  return moment.unix(parseInt(date)).format("dddd");
}

function correctCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

function getStoredSearches() {
  return JSON.parse(localStorage.getItem(lsKey));
}

function newCity(city, country) {
  return { city: city, country: country };
}

function performAPIGETCall(queryURL, callbackFunction) {
  $.ajax({ url: queryURL, method: "GET" }).then(function (response) {
    callbackFunction(response);
  });
}

function testFunction(mFunction, ...args) {
  console.log(mFunction(...args));
}

function newDay(date, icon, description, temp, humidity) {
  return {
    date: date,
    icon: icon,
    description: description,
    temp: temp,
    humidity: humidity,
  };
}
