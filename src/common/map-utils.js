import mapboxgl from "mapbox-gl";
import ReactDOMServer from "react-dom/server";

import { utils, classes } from "./";

import "./index.css";

const computeBounds = coordinates => {
  const point = new mapboxgl.LngLat(coordinates[0][0], coordinates[0][1]);
  const initBounds = new mapboxgl.LngLatBounds(point, point);
  return coordinates.reduce(
    (bounds, [lng, lat]) => bounds.extend(new mapboxgl.LngLat(lng, lat)),
    initBounds
  );
};

const getNewLayerRemoveOldLayer = async (mapRef, primitive, jsonIndex) => {
  let layerId = `${primitive}_${jsonIndex}`;
  if (!Boolean(jsonIndex)) {
    if (mapRef.current.getLayer(`${primitive}_${0}`)) {
      await mapRef.current.removeLayer(`${primitive}_${0}`);
      await mapRef.current.removeSource(`${primitive}_${0}`);
    }
    if (mapRef.current.getLayer(`${primitive}_${1}`)) {
      await mapRef.current.removeLayer(`${primitive}_${1}`);
      await mapRef.current.removeSource(`${primitive}_${1}`);
    }
  }
  return layerId;
};

const mouseEnterCallback = (e, mapRef, popupRef) => {
  mapRef.current.getCanvas().style.cursor = "pointer";
  let coordinates = e.features[0].geometry.coordinates.slice();
  const description = e.features[0].properties.description;
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180)
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  popupRef.current
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(mapRef.current);
};

const mouseClickCallback = (
  e,
  mapRef,
  popupRef,
  deviceStatusMarker,
  getStatusTable
) => {
  const { start, end } = deviceStatusMarker;
  mapRef.current.getCanvas().style.cursor = "pointer";
  const location =
    start && start.location
      ? start.location.coordinates
      : end && end.location
      ? end.location.coordinates
      : [];
  let coordinates = location.slice();
  const description = ReactDOMServer.renderToString(
    getStatusTable({
      type: "deviceStatusMarker",
      ...deviceStatusMarker
    })
  );
  popupRef.current
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(mapRef.current);
};

const mouseLeaveCallback = (mapRef, popupRef) => {
  mapRef.current.getCanvas().style.cursor = "";
  popupRef.current.remove();
};

const plotLine = async ({
  mapRef,
  popupRef,
  line,
  getStatusTable,
  fitBoundsOptions,
  jsonIndex
}) => {
  let newLayerId = await getNewLayerRemoveOldLayer(mapRef, "route", jsonIndex);
  mapRef.current
    .addLayer({
      id: newLayerId,
      type: "line",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: line
        }
      },
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "#6f4cff",
        "line-width": 8
      }
    })
    .fitBounds(computeBounds(line.coordinates), {
      ...fitBoundsOptions,
      padding: { top: 40, bottom: 40, left: 20, right: 20 }
    });

  newLayerId = await getNewLayerRemoveOldLayer(
    mapRef,
    "locationMarkers",
    jsonIndex
  );
  mapRef.current.addLayer({
    id: newLayerId,
    type: "symbol",
    source: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: line.coordinates.map(([lng, lat, alt, recorded_at]) => ({
          type: "Feature",
          properties: {
            description: ReactDOMServer.renderToString(
              getStatusTable({
                type: "locationMarker",
                coordinates: [lat, lng],
                alt,
                recorded_at
              })
            ),
            icon: "marker"
          },
          geometry: new classes.Point({
            type: "Point",
            coordinates: [lng, lat]
          })
        }))
      }
    },
    layout: {
      "icon-image": "{icon}-15",
      "icon-allow-overlap": false
    }
  });

  mapRef.current.on("mouseenter", newLayerId, event =>
    mouseEnterCallback(event, mapRef, popupRef)
  );

  mapRef.current.on("mouseleave", newLayerId, () =>
    mouseLeaveCallback(mapRef, popupRef)
  );
};

const useMarkers = async ({
  mapRef,
  popupRef,
  markersRef,
  deviceStatusMarkers,
  getStatusTable,
  fitBoundsOptions,
  jsonIndex
}) => {
  if (markersRef.current && markersRef.current.length && jsonIndex !== 1)
    markersRef.current.forEach(marker => marker.remove());
  let markerList = [];
  const newLayerId = await getNewLayerRemoveOldLayer(
    mapRef,
    "deviceStatusMarkers",
    jsonIndex
  );
  deviceStatusMarkers.forEach(deviceStatusMarker => {
    const { start, end, deviceStatus, activity } = deviceStatusMarker;
    if (start || end) {
      const variant = utils.getIcon(activity || deviceStatus);
      const markerElement = document.createElement("div");
      markerElement.className = "marker-container";

      markerElement.innerHTML = `<img src=${utils.getImageSource(
        variant
      )} alt=${variant} class="marker-image"/>`;

      markerElement.addEventListener("mouseenter", event =>
        mouseClickCallback(
          event,
          mapRef,
          popupRef,
          deviceStatusMarker,
          getStatusTable
        )
      );
      markerElement.addEventListener("mouseleave", () =>
        mouseLeaveCallback(mapRef, popupRef)
      );
      const location =
        start && start.location
          ? start.location.coordinates
          : end && end.location
          ? end.location.coordinates
          : [];
      markerList.push(
        new mapboxgl.Marker(markerElement)
          .setLngLat(location)
          .addTo(mapRef.current)
      );
    }
  });

  mapRef.current.on("mouseenter", newLayerId, event =>
    mouseEnterCallback(event, mapRef, popupRef)
  );

  mapRef.current.on("mouseleave", newLayerId, () =>
    mouseLeaveCallback(mapRef, popupRef)
  );
  markersRef.current = markerList;
};

export default {
  plotLine,
  useMarkers
};
