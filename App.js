import React, { useEffect, useState } from "react";
import moment from "moment-timezone";

const GeolocationApp = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    address: null,
    timezone: null,
    gmtOffset: null,
    currentTime: null,
  });

  const apiKey = "AIzaSyA4-xQAb6NdukFrmSiR8nYzJXYEthV055A"; // Replace with your API Key

  const getLocation = () => {
    setLocation((prev) => ({ ...prev, loading: true }));

    if (!navigator.geolocation) {
      setLocation({
        ...location,
        error: "Geolocation is not supported by your browser",
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
          error: null,
          loading: false,
        }));

        getAddress(latitude, longitude);
        getTimeZone(latitude, longitude);
      },
      (error) => {
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission denied by the user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }
        setLocation({
          ...location,
          error: errorMessage,
          loading: false,
        });
      }
    );
  };

  const getAddress = async (lat, lng) => {
    const apiKey = "AIzaSyA4-xQAb6NdukFrmSiR8nYzJXYEthV055A"; // key for api
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);

      if (data.status === "OK" && data.results.length > 0) {
        // Find the result with a 'premise' type
        const premiseResult = data.results.find((result) =>
          result.types.includes("premise")
        );

        // Set the address based on the premise result or a default message
        setLocation((prev) => ({
          ...prev,
          address: premiseResult
            ? premiseResult.formatted_address
            : "Premise address not found",
        }));
      } else {
        setLocation((prev) => ({
          ...prev,
          address: "Address not found",
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setLocation((prev) => ({
        ...prev,
        address: "Error fetching address",
      }));
    }
  };

  const getTimeZone = async (lat, lng) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        setLocation((prev) => ({
          ...prev,
          timezone: data.timeZoneName,
          gmtOffset: data.rawOffset / 3600,
          currentTime: moment().tz(data.timeZoneId).format("LLLL"),
        }));
      }
    } catch (error) {
      setLocation((prev) => ({
        ...prev,
        timezone: "Time Zone Not Found",
      }));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getTimeZone(location.latitude, location.longitude);
    }, 1000);
    return () => clearInterval(interval);
  }, [location.latitude]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "10px" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>🌍 Geolocation App</h1>
      <div style={{ textAlign: "center" }}>
        <button
          onClick={getLocation}
          style={{
            padding: "15px 30px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Get My Location
        </button>
      </div>

      {location.loading && (
        <p style={{ textAlign: "center", color: "#007BFF" }}>
          📍 Fetching location...
        </p>
      )}

      {location.latitude && location.longitude && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3>Your Location:</h3>
          <p>
            Latitude: {location.latitude} | Longitude: {location.longitude}
          </p>
          <iframe
            title="Google Map"
            width="600px"
            height="400px"
            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${location.latitude},${location.longitude}`}
            style={{ border: "0", borderRadius: "10px" }}
          ></iframe>

          <h3>🏡 Address:</h3>
          <p>{location.address}</p>

          <h3>🕰️ Time Zone:</h3>
          <p>
            {location.timezone} <br /> GMT Offset: {location.gmtOffset} Hours
          </p>

          <h3>⏰ Current Time:</h3>
          <p>{location.currentTime}</p>
        </div>
      )}

      {location.error && (
        <p style={{ textAlign: "center", color: "red" }}>⚠️ {location.error}</p>
      )}
    </div>
  );
};

export default GeolocationApp;
