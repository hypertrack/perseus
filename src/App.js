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

const loadDefault = params.get("loadDefault");

function App() {
  const [showTripModal, updateShowTripModal] = React.useState(true);
  const [json, updateJson] = React.useState(
    loadDefault ? defaultJSON : undefined
  );
  const mapRef = hooks.useMap(mapContainerId);
  const popupRef = hooks.usePopup(mapRef);

  const handleJsonUpdate = (json, fromLocalstorage) => {
    updateJson(json);
    if (!fromLocalstorage)
      localStorage.setItem("previousJSON", JSON.stringify(json));
    const { locations, markers } = json.summary;
    const line = new classes.Line(locations);
    const deviceStatusMarkers = utils.markersByType(markers)("device_status");
    mapUtils.plotLine(mapRef, line);
    mapUtils.plotMarkers(mapRef, popupRef, deviceStatusMarkers, getStatusTable);
  };

  React.useEffect(() => {
    if (loadDefault) window.history.replaceState({}, "", "?loadDefault=false");
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
