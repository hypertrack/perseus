import React from "react";

import TripInfoModal from "./components/TripInfoModal";
import DeviceStatusTable from "./components/DeviceStatusTable";

import { mapUtils, hooks, classes, utils } from "./common";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

const mapContainerId = "map-container";

const getStatusTable = props => <DeviceStatusTable {...props} />;

const params = new URLSearchParams(window.location.search);

const gistURL = params.get("gist");

const locationArrays = params.get("locations");

const shed_animation = params.get("shed_animation") === "true";

const urlAccessToken = params.get("accessToken");

const hash = params.get("hash") === "false";

const coordinates = JSON.parse(locationArrays);

function App() {
  const [showTripModal, updateShowTripModal] = React.useState(true);
  const [json, updateJson] = React.useState(undefined);
  const [error, updateError] = React.useState(undefined);
  const accessToken = hooks.useAccessToken(urlAccessToken);
  const mapRef = hooks.useMap(mapContainerId, {
    accessToken,
    hash,
    fitBoundsOptions: { linear: shed_animation }
  });
  const locationPopupRef = hooks.usePopup(mapRef);
  const deviceStatusPopupRef = hooks.usePopup(mapRef, { offset: 10 });
  const markersRef = React.useRef([]);

  React.useEffect(() => {
    if (accessToken) {
      if (gistURL) {
        const gistId = gistURL.split("/").pop();
        fetch(`https://api.github.com/gists/${gistId}`)
          .then(response => response.json())
          .then(data => {
            if (data.message) {
              console.error(data.message);
              updateError(data.message);
            } else {
              const json = JSON.parse(
                data.files["default.json"]
                  ? data.files["default.json"].content
                  : Object.values(data.files)[0].content
              );
              updateJson(json);
            }
          })
          .catch(error => {
            console.error(error);
            updateError(error);
          });
      } else if (coordinates && coordinates.length) {
        const line = new classes.Line({ coordinates, type: "LineString" });
        mapRef.current.on("load", () => handleJsonUpdate(line, true, false));
      } else {
        const previousJSON = localStorage.getItem("previousJSON");
        const tripJSON = JSON.parse(previousJSON);
        if (tripJSON)
          mapRef.current.on("load", () => handleJsonUpdate(tripJSON, true));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleJsonUpdate = (json, fromLocalstorage, showModal) => {
    updateJson(json);
    if (!fromLocalstorage)
      localStorage.setItem("previousJSON", JSON.stringify(json, null, "\t"));
    if (json.type === "LineString") {
      const line = new classes.Line(json);
      mapUtils.plotLine(mapRef, locationPopupRef, line, getStatusTable);
      if (!showModal) updateShowTripModal(false);
    } else {
      try {
        const { locations, markers } = json.summary;
        const line = new classes.Line(locations);
        const deviceStatusMarkers = utils.markersByType(markers)(
          "device_status"
        );
        mapUtils.plotLine(mapRef, locationPopupRef, line, getStatusTable);
        mapUtils.useMarkers(
          mapRef,
          deviceStatusPopupRef,
          markersRef,
          deviceStatusMarkers,
          getStatusTable
        );
      } catch (error) {
        console.error(error);
        updateError(error);
      }
    }
  };

  if (!accessToken && !error) updateError({ message: "Access Token missing" });

  return (
    <div className="app-container">
      {accessToken && <div id={mapContainerId} />}
      <TripInfoModal
        fetchError={error}
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
