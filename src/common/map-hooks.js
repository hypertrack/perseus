import React from "react";
import mapboxgl from "mapbox-gl";
import { Intent } from "@blueprintjs/core";

import { utils } from "./";

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
        accessToken,
        ...rest
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, accessToken]);

  React.useEffect(() => {
    if (accessToken) mapboxgl.accessToken = accessToken;
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

const useAccessToken = (urlToken, errorHandler) => {
  const [accessToken, updateAccessToken] = React.useState(urlToken);
  React.useEffect(() => {
    if (!urlToken) {
      const knownToken = localStorage.getItem("accessToken");
      if (knownToken) {
        utils.AppToaster.show({
          timeout: 2000,
          intent: Intent.SUCCESS,
          message: "👋Welcome back"
        });
        mapboxgl.accessToken = knownToken;
        updateAccessToken(knownToken);
      }
    } else {
      utils.AppToaster.show({
        icon: "tick",
        intent: Intent.SUCCESS,
        message: (
          <>
            <code>accessToken</code> set.
          </>
        )
      });
      localStorage.setItem("accessToken", urlToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlToken]);
  React.useEffect(() => {
    if (accessToken) errorHandler();
    else errorHandler("Missing access token");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);
  return accessToken;
};

export default {
  useMap,
  usePopup,
  useAccessToken
};
