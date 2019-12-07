import mapboxgl from "mapbox-gl";

import { utils, classes } from "./";

import ReactDOMServer from "react-dom/server";

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

const mouseLeaveCallback = (mapRef, popupRef) => {
  mapRef.current.getCanvas().style.cursor = "";
  popupRef.current.remove();
};

const plotLine = (mapRef, popupRef, line, getStatusTable, options) => {
  const { shed_animation } = options;
  let newLayerId = getNewLayerRemoveOldLayer(mapRef, "route");
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
      linear: shed_animation,
      padding: { top: 40, bottom: 40, left: 20, right: 20 }
    });

  newLayerId = getNewLayerRemoveOldLayer(mapRef, "locationMarkers");
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

const plotMarkers = (mapRef, popupRef, deviceStatusMarkers, getStatusTable) => {
  const newLayerId = getNewLayerRemoveOldLayer(mapRef, "deviceStatusMarkers");
  mapRef.current.addLayer({
    id: newLayerId,
    type: "symbol",
    source: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: deviceStatusMarkers.reduce(
          (features, { start, end, deviceStatus, activity, duration }) =>
            start.location && end.location
              ? [
                  ...features,
                  {
                    type: "Feature",
                    properties: {
                      description: ReactDOMServer.renderToString(
                        getStatusTable({
                          type: "deviceStatusMarker",
                          start,
                          end,
                          deviceStatus
                        })
                      ),
                      icon: utils.getIcon(deviceStatus, activity)
                    },
                    geometry: start.location
                  },
                  {
                    type: "Feature",
                    properties: {
                      description: ReactDOMServer.renderToString(
                        getStatusTable({
                          type: "deviceStatusMarker",
                          start,
                          end,
                          deviceStatus,
                          activity,
                          duration
                        })
                      ),
                      icon: utils.getIcon(deviceStatus, activity, "circle")
                    },
                    geometry: end.location
                  }
                ]
              : [
                  ...features,
                  {
                    type: "Feature",
                    properties: {
                      description: ReactDOMServer.renderToString(
                        getStatusTable({
                          type: "deviceStatusMarker",
                          start,
                          end,
                          deviceStatus,
                          activity,
                          duration
                        })
                      ),
                      icon: utils.getIcon(deviceStatus, activity)
                    },
                    geometry: end.location || start.location
                  }
                ],
          []
        )
      }
    },
    layout: {
      "icon-image": "{icon}",
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

export default {
  plotLine,
  plotMarkers
};
