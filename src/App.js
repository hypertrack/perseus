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

const hash = !(params.get("hash") && params.get("hash") === "false");

const coordinates = JSON.parse(locationArrays);

function App() {
  const [mainSet, updateMainSet] = React.useState([]);
  const [showTripModal, updateShowTripModal] = React.useState(true);
  const [json, updateJson] = React.useState(undefined);
  const [error, updateError] = React.useState(undefined);
  // const [userAccessToken, updateUserAccessToken] = React.useState(undefined);
  const accessToken = hooks.useAccessToken(urlAccessToken, updateError);
  const fitBoundsOptions = { linear: shed_animation };
  const mapRef = hooks.useMap(mapContainerId, {
    accessToken,
    hash,
    fitBoundsOptions
  });
  const locationPopupRef = hooks.usePopup(mapRef);
  const deviceStatusPopupRef = hooks.usePopup(mapRef, { offset: 10 });
  const markersRef = React.useRef([]);

  const secondInput = Boolean(mainSet.length) > 1;

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
    //  else {
    //   const newAccessToken = window.prompt("Enter your Mapbox Access Token:");
    //   if (newAccessToken) updateUserAccessToken(newAccessToken);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const addSecondJson = firstJson => {
    if (!error) updateMainSet([firstJson]);
  };

  const handleJsonUpdate = (json, fromLocalstorage, showModal) => {
    updateJson(json);
    const newMainSet = [...mainSet, json];
    if (secondInput) updateMainSet(newMainSet);
    if (!fromLocalstorage && !secondInput)
      localStorage.setItem("previousJSON", JSON.stringify(json, null, "\t"));
    newMainSet.forEach((setItem, jsonIndex) => {
      if (json.type === "LineString") {
        const line = new classes.Line(json);
        mapUtils.plotLine({
          mapRef,
          popupRef: locationPopupRef,
          line,
          getStatusTable,
          fitBoundsOptions,
          jsonIndex
        });
        if (!showModal) updateShowTripModal(false);
      } else {
        try {
          const { locations, markers } = json.summary;
          const line = new classes.Line(locations);
          const deviceStatusMarkers = utils.markersByType(markers)(
            "device_status"
          );
          mapUtils.plotLine({
            mapRef,
            popupRef: locationPopupRef,
            line,
            getStatusTable,
            fitBoundsOptions,
            jsonIndex
          });
          mapUtils.useMarkers({
            mapRef,
            popupRef: deviceStatusPopupRef,
            markersRef,
            deviceStatusMarkers,
            getStatusTable,
            jsonIndex
          });
        } catch (error) {
          console.error(error);
          updateError(error);
        }
      }
    });
  };

  const trip = Boolean(mainSet.length) ? undefined : json;

  return (
    <div className="app-container">
      {accessToken && <div id={mapContainerId} />}
      <TripInfoModal
        fetchError={error}
        trip={trip}
        showTripModal={showTripModal}
        showModal={() => updateShowTripModal(true)}
        hideModal={() => updateShowTripModal(false)}
        updateJson={handleJsonUpdate}
        addSecondJson={addSecondJson}
        secondInput={Boolean(mainSet.length)}
      />
    </div>
  );
}

export default App;
