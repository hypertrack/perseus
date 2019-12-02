import React from "react";
import ReactDOMServer from "react-dom/server";

import TripInfoModal from "./components/TripInfoModal";
import DeviceStatusTable from "./components/DeviceStatusTable";

import { mapUtils, hooks, classes, utils } from "./common";

import "./App.css";

const json = require("./template/3.json");

const mapContainerId = "map-container";

function App() {
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
      mapRef.current.on("load", () => {
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
      });
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

  return (
    <div className="app-container">
      <div id={mapContainerId} />
      <TripInfoModal trip={json} />
    </div>
  );
}

export default App;
