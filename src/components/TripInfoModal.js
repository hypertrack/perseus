import React from "react";
import { TextArea, Dialog, Button } from "@blueprintjs/core";

import "./component.css";

const TripInfoModal = ({
  trip,
  showTripModal,
  updateJson,
  hideModal,
  showModal
}) => {
  const [userJson, updateUserJson] = React.useState(
    JSON.stringify(trip, null, "\n")
  );

  const handleUpdateJson = e => {
    try {
      const updatedJson = JSON.parse(userJson);
      updateJson(updatedJson);
      hideModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = e => {
    updateUserJson(JSON.stringify(trip, null, "\n"));
    hideModal();
  };

  return (
    <>
      <Button
        className={`show-trip-button ${showTripModal ? "hide" : ""}`}
        onClick={() => (showTripModal ? hideModal() : showModal())}
      >
        Change JSON
      </Button>
      <Dialog isOpen={showTripModal} className="overlay" onClose={hideModal}>
        <TextArea
          value={userJson}
          disabled={false}
          onChange={e => updateUserJson(e.target.value)}
          className="user-summary-input"
        />
        <button onClick={handleUpdateJson}>Update JSON</button>
        <button onClick={handleCloseModal}>Cancel</button>
      </Dialog>
    </>
  );
};

export default TripInfoModal;
