import React from "react";
import mapboxgl from "mapbox-gl";

const useMap = container => {
  const mapRef = React.useRef();
  React.useEffect(() => {
    if (!mapRef || !mapRef.current)
      mapRef.current = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/streets-v9",
        accessToken:
          "pk.eyJ1IjoiaHlwZXJ0cmFjay1kZXZvcHMiLCJhIjoiY2ptZzVndTduMWZ0YzNrbzFuNXR0cHUyOSJ9.Te8DokzaOXSVdh7ntUptyA",
        keyboard: true,
        center: [0, 0]
      });
  }, [container]);
  return mapRef;
};

const usePopup = (mapRef, options = {}) => {
  const popupRef = React.useRef(
    new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      ...options
    })
  );
  React.useEffect(() => {
    mapRef.current.on("load", () => {
      popupRef.current.addTo(mapRef.current);
    });
  }, [mapRef, popupRef]);
  return popupRef;
};

export default {
  useMap,
  usePopup
};
