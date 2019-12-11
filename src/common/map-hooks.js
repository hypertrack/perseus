import React from "react";
import mapboxgl from "mapbox-gl";

const useMap = (container, options) => {
  const { accessToken, ...rest } = options;
  const mapRef = React.useRef();
  React.useEffect(() => {
    if ((!mapRef || !mapRef.current) && accessToken)
      mapRef.current = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/streets-v9",
        keyboard: true,
        center: [0, 0],
        hash: true,
        accessToken,
        ...rest
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container]);

  React.useEffect(() => {
    mapboxgl.accessToken = accessToken;
  }, [accessToken]);
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
    if (mapRef.current)
      mapRef.current.on("load", () => {
        popupRef.current.addTo(mapRef.current);
      });
  }, [mapRef, popupRef]);
  return popupRef;
};

const useAccessToken = urlToken => {
  const [accessToken, updateAccessToken] = React.useState(urlToken);
  React.useEffect(() => {
    if (!urlToken) {
      const knownToken = localStorage.getItem("accessToken");
      if (knownToken) {
        mapboxgl.accessToken = knownToken;
        updateAccessToken(knownToken);
      }
    } else localStorage.setItem("accessToken", urlToken);
  }, [urlToken]);
  return accessToken;
};

export default {
  useMap,
  usePopup,
  useAccessToken
};
