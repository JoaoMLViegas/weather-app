import React, { useState, useEffect } from "react";
import { fetchWeatherApi } from "openmeteo";

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [latitude, setLatitude] = useState("51.5085"); // Default values for London
  const [longitude, setLongitude] = useState("-0.1257");

  const handleFetchWeather = async () => {
    try {
      const params = {
        latitude,
        longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "is_day",
          "precipitation",
          "cloud_cover",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
        ],
        daily: [
          "temperature_2m_max",
          "temperature_2m_min",
          "sunrise",
          "sunset",
          "uv_index_max",
          "wind_speed_10m_max",
          "wind_gusts_10m_max",
          "wind_direction_10m_dominant",
        ],
        timezone: "auto",
        forecast_days: 3,
      };

      const url = "https://api.open-meteo.com/v1/forecast";
      const responses = await fetchWeatherApi(url, params);

      // Process the response as before
      const response = responses[0];

      const range = (start: number, stop: number, step: number) =>
        Array.from(
          { length: (stop - start) / step },
          (_, i) => start + i * step
        );

      const utcOffsetSeconds = response.utcOffsetSeconds();
      const daily = response.daily();

      const weatherData = {
        current: {
          temperature: response.current()?.variables(0)?.value(),
          humidity: response.current()?.variables(1)?.value(),
          isDay: response.current()?.variables(2)?.value(),
          precipitation: response.current()?.variables(3)?.value(),
          cloudCover: response.current()?.variables(4)?.value(),
          windSpeed: response.current()?.variables(5)?.value(),
          windDirection: response.current()?.variables(6)?.value(),
          windGusts: response.current()?.variables(7)?.value(),
        },
        daily: {
          time: range(
            Number(daily?.time()),
            Number(daily?.timeEnd()),
            daily?.interval() ?? 1
          ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
          temperatureMax: daily?.variables(0)?.valuesArray() || [],
          temperatureMin: daily?.variables(1)?.valuesArray() || [],
          sunrise: daily?.variables(2)?.valuesArray() || [],
          sunset: daily?.variables(3)?.valuesArray() || [],
          uvIndexMax: daily?.variables(4)?.valuesArray() || [],
          windSpeedMax: daily?.variables(5)?.valuesArray() || [],
          windGustsMax: daily?.variables(6)?.valuesArray() || [],
          windDirectionDominant: daily?.variables(7)?.valuesArray() || [],
        },
      };

      console.log("Fetched and processed weather data:", weatherData);
      setWeatherData(weatherData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchWeather();
  }, []); // Require button click for changes

  if (loading) return <div>Loading...</div>;
  if (!weatherData) return <div>Failed to load weather data.</div>;

  return (
    <div id="#top" className="container my-5">
      <h1 className="text-center mb-4">Weather App</h1>

      {/* Navigation Links */}
      <div className="mb-4 text-center">
        <a href="#enter-coordinates" className="btn btn-link">
          Enter Coordinates
        </a>
        <a href="#current-weather" className="btn btn-link">
          Current Weather
        </a>
        <a href="#daily-weather" className="btn btn-link">
          Daily Weather
        </a>
      </div>

      {/* Input Form */}
      <div id="enter-coordinates" className="card p-4 shadow mb-4">
        <h2 className="mb-3">Enter Coordinates</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="latitude" className="form-label">
              Latitude
            </label>
            <input
              type="text"
              id="latitude"
              className="form-control"
              value={latitude}
              onChange={(e) => {
                const value = e.target.value;
                setLatitude(value);
              }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="longitude" className="form-label">
              Longitude
            </label>
            <input
              type="text"
              id="longitude"
              className="form-control"
              value={longitude}
              onChange={(e) => {
                const value = e.target.value;
                setLongitude(value);
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={handleFetchWeather}
          >
            Fetch Weather
          </button>
        </form>
        <p className="mt-3 text-muted">
          Don't know the coordinates? Check out{" "}
          <a
            href="https://simplemaps.com/resources/free-country-cities"
            target="_blank"
            rel="noopener noreferrer"
          >
            this tool
          </a>{" "}
          to find them! <br />
          <em>
            In development... in the future, we hope to have this functionality
            internally.
          </em>
        </p>
      </div>

      {/* Weather Data Display */}
      {weatherData ? (
        <>
          <div id="current-weather" className="card p-4 shadow mb-4">
            <h2 className="mb-3">Current Weather</h2>
            <ul className="list-group mb-4">
              <li className="list-group-item">
                <strong>Temperature:</strong>{" "}
                {Math.round(weatherData.current.temperature)}°C
              </li>
              <li className="list-group-item">
                <strong>Humidity:</strong> {weatherData.current.humidity}%
              </li>
              <li className="list-group-item">
                <strong>Day/Night:</strong>{" "}
                {weatherData.current.isDay ? "Day" : "Night"}
              </li>
              <li className="list-group-item">
                <strong>Precipitation:</strong>{" "}
                {weatherData.current.precipitation
                  ? `${weatherData.current.precipitation} mm`
                  : "No precipitation"}
              </li>
              <li className="list-group-item">
                <strong>Cloud Cover:</strong> {weatherData.current.cloudCover}%
              </li>
              <li className="list-group-item">
                <strong>Wind Speed:</strong>{" "}
                {Math.round(weatherData.current.windSpeed)} km/h
              </li>
              <li className="list-group-item">
                <strong>Wind Direction:</strong>{" "}
                {Math.round(weatherData.current.windDirection)}°
              </li>
              <li className="list-group-item">
                <strong>Wind Gusts:</strong>{" "}
                {Math.round(weatherData.current.windGusts)} km/h
              </li>
            </ul>
          </div>

          <div id="daily-weather" className="card p-4 shadow">
            <h2 className="mb-3">Daily Weather Forecast</h2>
            <ul className="list-group">
              {Object.keys(weatherData.daily.temperatureMax).map((dayIndex) => (
                <li key={dayIndex} className="list-group-item">
                  <strong>Date:</strong>{" "}
                  {new Date(
                    weatherData.daily.time[dayIndex]
                  ).toLocaleDateString()}
                  <ul className="mt-2">
                    <li>
                      <strong>Max Temperature:</strong>{" "}
                      {Math.round(weatherData.daily.temperatureMax[dayIndex])}°C
                    </li>
                    <li>
                      <strong>Min Temperature:</strong>{" "}
                      {Math.round(weatherData.daily.temperatureMin[dayIndex])}°C
                    </li>
                    <li>
                      <strong>Max UV Index:</strong>{" "}
                      {Math.round(
                        (weatherData.daily.uvIndexMax[dayIndex] +
                          Number.EPSILON) *
                          100
                      ) / 100}
                    </li>
                    <li>
                      <strong>Max Wind Speed:</strong>{" "}
                      {Math.round(weatherData.daily.windSpeedMax[dayIndex])}{" "}
                      km/h
                    </li>
                    <li>
                      <strong>Max Wind Gusts:</strong>{" "}
                      {Math.round(weatherData.daily.windGustsMax[dayIndex])}{" "}
                      km/h
                    </li>
                    <li>
                      <strong>Dominant Wind Direction:</strong>{" "}
                      {Math.round(
                        weatherData.daily.windDirectionDominant[dayIndex]
                      )}
                      °
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-center text-muted mt-4">
          No weather data available. Enter coordinates to fetch data.
        </p>
      )}

      {/* Back to Top Link */}
      <div className="text-center mt-4">
        <a href="#top" className="btn btn-secondary">
          Back to Top
        </a>
      </div>
      <a
        href="https://www.flaticon.com/free-icons/weather-app"
        title="weather app icons"
        target="_blank"
        rel="noopener noreferrer"
      >
        Weather app icons created by Freepik - Flaticon
      </a>
    </div>
  );
};

export default Weather;
