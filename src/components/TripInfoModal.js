import React from "react";
import {
  TextArea,
  Dialog,
  Button,
  Classes,
  Intent,
  FileInput,
  HTMLTable
} from "@blueprintjs/core";

import { utils } from "./../common";

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
  const [errors, updateErrors] = React.useState("");

  const validateInput = tripJSON => {
    const validationErrors = utils.validateTripJSON(tripJSON);
    if (validationErrors && validationErrors.length)
      updateErrors(validationErrors);
    else updateErrors(null);
    return Boolean(validationErrors);
  };

  const handleUpdateJson = e => {
    try {
      const updatedJson = JSON.parse(userJson);
      updateJson(updatedJson);
      hideModal();
    } catch (error) {
      console.error(error);
      updateErrors([error]);
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
      const tripJSON = JSON.parse(derivedFileValue);
      updateUserJson(derivedFileValue);
      if (!validateInput(tripJSON)) {
        updateJson(tripJSON);
        hideModal();
      }
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
        isOpen={errors || showTripModal}
        title="Add your own JSON"
        onClose={hideModal}
        className="dialog"
      >
        <div className={Classes.DIALOG_BODY}>
          <div className="dialog-container">
            <TextArea
              value={userJson}
              disabled={false}
              onChange={e => updateUserJson(e.target.value)}
              className={"user-summary-input"}
              placeholder={"Paste trip_summary here"}
              onBlur={e => validateInput(JSON.parse(e.target.value))}
            />
            {errors && errors.length ? (
              <div className={"error-table-container"}>
                <HTMLTable className={"error-table"} bordered>
                  <caption>
                    There are {errors.length} issue
                    {errors.length > 1 ? "s" : ""}
                  </caption>
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map(error => (
                      <tr key={error.dataPath}>
                        <td>
                          <div className="table-content">{error.dataPath}</div>
                        </td>
                        <td>
                          <div className="table-content">{error.message}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {JSON.stringify(errors)}
                </HTMLTable>
              </div>
            ) : null}
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <FileInput
              text={"Click to upload"}
              buttonText={"Browse"}
              className="file-input"
              onInputChange={handleFileUpload}
              value={filename}
              inputProps={{ accept: ".json" }}
            />
            <Button
              disabled={(errors && errors.length) || !userJson}
              onClick={handleCloseModal}
            >
              Close
            </Button>
            <Button
              intent={Intent.PRIMARY}
              disabled={(errors && errors.length) || !userJson}
              onClick={handleUpdateJson}
            >
              Update
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default TripInfoModal;
