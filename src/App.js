import React from "react";
import ReactDOMServer from "react-dom/server";

import TripInfoModal from "./components/TripInfoModal";
import DeviceStatusTable from "./components/DeviceStatusTable";

import { mapUtils, hooks, classes, utils } from "./common";

import "./App.css";

const template = require("./template/3.json");

const mapContainerId = "map-container";

const plotLine = (mapRef, line) => {
  if (mapRef.current.getLayer("route") || mapRef.current.getLayer("route1")) {
    const newLayerId = mapRef.current.getLayer() ? "route1" : "route";
    const oldLayerId = mapRef.current.getLayer("route") ? "route" : "route1";
    mapRef.current.removeLayer(oldLayerId);
    mapRef.current.removeSource(oldLayerId);
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
      .fitBounds(mapUtils.computeBounds(line.coordinates), {
        padding: { top: 40, bottom: 40, left: 20, right: 20 }
      });
  } else {
    mapRef.current
      .addLayer({
        id: "route",
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
      .fitBounds(mapUtils.computeBounds(line.coordinates), {
        padding: { top: 40, bottom: 40, left: 20, right: 20 }
      });
  }
};

function App() {
  const [showTripModal, updateShowTripModal] = React.useState(false);
  const [json, updateJson] = React.useState(template);
  const mapRef = hooks.useMap(mapContainerId);
  const popupRef = hooks.usePopup(mapRef);
  const line = new classes.Line(json.summary.locations);

  const markers = json.summary.markers.reduce(
    (markers, currentMarker) => ({
      ...markers,
      [currentMarker.type]: markers[currentMarker.type]
        ? [utils.parseMarker(currentMarker), ...markers[currentMarker.type]]
        : [utils.parseMarker(currentMarker)]
    }),
    {}
  );

  const deviceStatusMarkers = markers.device_status;

  // effect that maintains and plots polyline
  React.useEffect(() => {
    if (line instanceof classes.Line && mapRef && mapRef.current) {
      mapRef.current.on("load", () => plotLine(mapRef, line));
    }
  }, [line, mapRef]);

  React.useEffect(() => {
    if (deviceStatusMarkers.length && mapRef) {
      mapRef.current.on("load", () => {
        mapRef.current.addLayer({
          id: "deviceStatusMarkers",
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
                              <DeviceStatusTable
                                start={start}
                                end={end}
                                deviceStatus={deviceStatus}
                              />
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
                              <DeviceStatusTable
                                start={start}
                                end={end}
                                deviceStatus={deviceStatus}
                                activity={activity}
                                duration={duration}
                              />
                            ),
                            icon: utils.getIcon(
                              deviceStatus,
                              activity,
                              "circle"
                            )
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
                              <DeviceStatusTable
                                start={start}
                                end={end}
                                deviceStatus={deviceStatus}
                                activity={activity}
                                duration={duration}
                              />
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
      });
    }
  }, [deviceStatusMarkers, mapRef, popupRef]);

  const handleJsonUpdate = json => {
    updateJson(json);
    const line = new classes.Line(json.summary.locations);
    plotLine(mapRef, line);
  };

  return (
    <div className="app-container">
      <div id={mapContainerId} />
      <TripInfoModal
        trip={json}
        showTripModal={showTripModal}
        showModal={() => updateShowTripModal(true)}
        hideModal={() => updateShowTripModal(false)}
        updateJson={handleJsonUpdate}
      />
    </div>
  );
}

export default App;
