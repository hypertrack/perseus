import React from "react";
import mapboxgl from "mapbox-gl";

import { utils } from "./";

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
    mapRef.current.on("load", () => {
      utils.valid_device_status_states.forEach(status_type => {
        mapRef.current.loadImage(
          utils.getImageSource(status_type),
          (error, image) =>
            error
              ? console.error(error)
              : mapRef.current.addImage(status_type, image)
        );
      });
    });
  }, [container]);
  return mapRef;
};

const usePopup = (mapRef, options) => {
  const popupRef = React.useRef(
    new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
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
