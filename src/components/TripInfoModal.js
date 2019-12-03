import React from "react";
import { TextArea, Dialog, Button, Classes, Intent } from "@blueprintjs/core";

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
        intent={Intent.SUCCESS}
        className={"show-trip-button"}
        onClick={() => (showTripModal ? hideModal() : showModal())}
      >
        Update JSON
      </Button>
      <Dialog
        isOpen={showTripModal}
        title="Add your own JSON"
        onClose={hideModal}
        className="dialog"
      >
        <div className={Classes.DIALOG_BODY}>
          <TextArea
            value={userJson}
            disabled={false}
            onChange={e => updateUserJson(e.target.value)}
            className="user-summary-input"
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={handleCloseModal}>Close</Button>
            <Button intent={Intent.PRIMARY} onClick={handleUpdateJson}>
              Update
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default TripInfoModal;
