import React from "react";

import TripInfoModal from "./components/TripInfoModal";
import DeviceStatusTable from "./components/DeviceStatusTable";

import { mapUtils, hooks, classes, utils } from "./common";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

const mapContainerId = "map-container";

const getStatusTable = props => <DeviceStatusTable {...props} />;

function App() {
  const [showTripModal, updateShowTripModal] = React.useState(true);
  const [json, updateJson] = React.useState();
  const mapRef = hooks.useMap(mapContainerId);
  const popupRef = hooks.usePopup(mapRef);

  const handleJsonUpdate = json => {
    updateJson(json);
    const { locations, markers } = json.summary;
    const line = new classes.Line(locations);
    const deviceStatusMarkers = utils.markersByType(markers)("device_status");
    mapUtils.plotLine(mapRef, line);
    mapUtils.plotMarkers(mapRef, popupRef, deviceStatusMarkers, getStatusTable);
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
