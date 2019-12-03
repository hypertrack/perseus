import mapboxgl from "mapbox-gl";

import { utils } from "./";

import ReactDOMServer from "react-dom/server";

const computeBounds = coordinates => {
  const point = new mapboxgl.LngLat(coordinates[0][0], coordinates[0][1]);
  const initBounds = new mapboxgl.LngLatBounds(point, point);
  return coordinates.reduce(
    (bounds, [lng, lat]) => bounds.extend(new mapboxgl.LngLat(lng, lat)),
    initBounds
  );
};

const plotLine = (mapRef, line) => {
  let newLayerId = "route";
  if (mapRef.current.getLayer("route") || mapRef.current.getLayer("route1")) {
    newLayerId = mapRef.current.getLayer("route") ? "route1" : "route";
    const oldLayerId = mapRef.current.getLayer("route") ? "route" : "route1";
    mapRef.current.removeLayer(oldLayerId);
    mapRef.current.removeSource(oldLayerId);
  }
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
      padding: { top: 40, bottom: 40, left: 20, right: 20 }
    });
};

const plotMarkers = (mapRef, popupRef, deviceStatusMarkers, getStatusTable) => {
  let newLayerId = "deviceStatusMarkers";
  if (
    mapRef.current.getLayer("deviceStatusMarkers") ||
    mapRef.current.getLayer("deviceStatusMarkers1")
  ) {
    newLayerId = mapRef.current.getLayer("deviceStatusMarkers")
      ? "deviceStatusMarkers1"
      : "deviceStatusMarkers";
    const oldLayerId = mapRef.current.getLayer("deviceStatusMarkers")
      ? "deviceStatusMarkers"
      : "deviceStatusMarkers1";
    mapRef.current.removeLayer(oldLayerId);
    mapRef.current.removeSource(oldLayerId);
  }
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
                        getStatusTable({ start, end, deviceStatus })
                      ),
                      icon: utils.getIcon(
                        deviceStatus,
                        activity,
                        "circle-stroked"
                      )
                    },
                    geometry: start.location
                  },
                  {
                    type: "Feature",
                    properties: {
                      description: ReactDOMServer.renderToString(
                        getStatusTable({
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
      "icon-image": "{icon}-15",
      "icon-allow-overlap": true
    }
  });

  mapRef.current.on("mouseenter", "deviceStatusMarkers", e => {
    mapRef.current.getCanvas().style.cursor = "pointer";
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180)
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    popupRef.current
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(mapRef.current);
  });

  mapRef.current.on("mouseleave", "deviceStatusMarkers", function() {
    mapRef.current.getCanvas().style.cursor = "";
    popupRef.current.remove();
  });
};

export default {
  plotLine,
  plotMarkers
};
