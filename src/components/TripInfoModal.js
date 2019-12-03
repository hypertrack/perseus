import React from "react";
import {
  TextArea,
  Dialog,
  Button,
  Classes,
  Intent,
  FileInput
} from "@blueprintjs/core";

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
  const [filename, updateFilename] = React.useState("");

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

  const handleFileUpload = event => {
    event && event.preventDefault();
    const fileReader = new FileReader();
    const file = event.target.files[0];
    updateFilename(file.name);
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = onloadEvent => {
      const derivedFileValue = onloadEvent.target.result;
      updateJson(JSON.parse(derivedFileValue));
      hideModal();
    };
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
            <FileInput
              text={"Click to upload"}
              buttonText={"Browse"}
              className="file-input"
              onInputChange={handleFileUpload}
              value={filename}
            />
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
