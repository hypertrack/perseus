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

const getNewLayerRemoveOldLayer = (mapRef, primitive) => {
  let newLayerId = primitive;
  if (
    mapRef.current.getLayer(primitive) ||
    mapRef.current.getLayer(`${primitive}1`)
  ) {
    newLayerId = mapRef.current.getLayer(primitive)
      ? `${primitive}1`
      : primitive;
    const oldLayerId = mapRef.current.getLayer(primitive)
      ? primitive
      : `${primitive}1`;
    mapRef.current.removeLayer(oldLayerId);
    mapRef.current.removeSource(oldLayerId);
  }
  return newLayerId;
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

const getLayerName = index => primitiveName => primitiveName + index;

const lineColorMap = {
  _zero_: "#6397FF",
  _one_: "#FF8D69"
};

const plotLine = ({
  mapRef,
  popupRef,
  line,
  getStatusTable,
  fitBoundsOptions,
  index
}) => {
  let newLayerId = getNewLayerRemoveOldLayer(
    mapRef,
    getLayerName(index)`route`
  );
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
        "line-color": lineColorMap[index],
        "line-width": 8
      }
    })
    .fitBounds(computeBounds(line.coordinates), {
      ...fitBoundsOptions,
      padding: { top: 40, bottom: 40, left: 20, right: 20 }
    });

  newLayerId = getNewLayerRemoveOldLayer(
    mapRef,
    getLayerName(index)`locationMarkers`
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

const useMarkers = ({
  mapRef,
  popupRef,
  markersRef,
  deviceStatusMarkers,
  getStatusTable,
  fitBoundsOptions,
  index
}) => {
  const newLayerId = getNewLayerRemoveOldLayer(
    mapRef,
    getLayerName(index)`deviceStatusMarkers`
  );
  const markerList = deviceStatusMarkers
    .map(deviceStatusMarker => {
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
        return new mapboxgl.Marker(markerElement)
          .setLngLat(location)
          .addTo(mapRef.current);
      }
      return null;
    })
    .filter(Boolean);

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
