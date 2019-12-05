import React from "react";

import TripInfoModal from "./components/TripInfoModal";
import DeviceStatusTable from "./components/DeviceStatusTable";

import { mapUtils, hooks, classes, utils } from "./common";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

const defaultJSON = require("./template/default.json");

const mapContainerId = "map-container";

const getStatusTable = props => <DeviceStatusTable {...props} />;

const params = new URLSearchParams(window.location.search);

const loadDefault = params.get("loadDefault") === "true";

const gistURL = params.get("gist");

function App() {
  const [showTripModal, updateShowTripModal] = React.useState(true);
  const [json, updateJson] = React.useState(
    loadDefault ? defaultJSON : undefined
  );
  const [error, updateError] = React.useState(false);
  const mapRef = hooks.useMap(mapContainerId);
  const popupRef = hooks.usePopup(mapRef);

  const handleJsonUpdate = (json, fromLocalstorage) => {
    updateJson(json);
    if (!fromLocalstorage)
      localStorage.setItem("previousJSON", JSON.stringify(json, null, "\t"));
    if (json.type === "LineString") {
      const line = new classes.Line(json);
      mapUtils.plotLine(mapRef, popupRef, line, getStatusTable);
    } else {
      try {
        const { locations, markers } = json.summary;
        const line = new classes.Line(locations);
        const deviceStatusMarkers = utils.markersByType(markers)(
          "device_status"
        );
        mapUtils.plotLine(mapRef, popupRef, line, getStatusTable);
        mapUtils.plotMarkers(
          mapRef,
          popupRef,
          deviceStatusMarkers,
          getStatusTable
        );
      } catch (error) {
        updateError(error);
      }
    }
  };

  React.useEffect(() => {
    if (gistURL) {
      const gistId = gistURL.split("/").pop();
      fetch(`https://api.github.com/gists/${gistId}`)
        .then(response => response.json())
        .then(data => {
          if (data.message) updateError(data.message);
          else {
            const json = JSON.parse(data.files["default.json"].content);
            updateJson(json);
          }
        })
        .catch(error => updateError(error));
    } else if (loadDefault)
      window.history.replaceState({}, "", "?loadDefault=false");
    else {
      const previousJSON = localStorage.getItem("previousJSON");
      const tripJSON = JSON.parse(previousJSON);
      if (tripJSON)
        mapRef.current.on("load", () => {
          handleJsonUpdate(tripJSON, true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      <div id={mapContainerId} />
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
