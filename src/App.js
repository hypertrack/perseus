import React from "react";

import TripInfoModal from "./components/TripInfoModal";
import DeviceStatusTable from "./components/DeviceStatusTable";

import { mapUtils, hooks, classes, utils } from "./common";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

const template = require("./template/3.json");

const mapContainerId = "map-container";

const getStatusTable = props => <DeviceStatusTable {...props} />;

function App() {
  const [showTripModal, updateShowTripModal] = React.useState(false);
  const [json, updateJson] = React.useState(template);
  const mapRef = hooks.useMap(mapContainerId);
  const popupRef = hooks.usePopup(mapRef);
  const line = new classes.Line(json.summary.locations);

  const deviceStatusMarkers = utils.markersByType(json.summary.markers)(
    "device_status"
  );

  // effect that maintains and plots polyline
  React.useEffect(() => {
    if (line instanceof classes.Line && mapRef && mapRef.current) {
      mapRef.current.on("load", () => mapUtils.plotLine(mapRef, line));
    }
  }, [line, mapRef]);

  React.useEffect(() => {
    if (deviceStatusMarkers.length && mapRef)
      mapRef.current.on("load", () =>
        mapUtils.plotMarkers(
          mapRef,
          popupRef,
          deviceStatusMarkers,
          getStatusTable
        )
      );
  }, [mapRef, popupRef, deviceStatusMarkers]);

  const handleJsonUpdate = json => {
    updateJson(json);
    const line = new classes.Line(json.summary.locations);
    const deviceStatusMarkers = utils.markersByType(json.summary.markers)(
      "device_status"
    );
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
