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
  showModal,
  fetchError
}) => {
  const [userJson, updateUserJson] = React.useState(
    JSON.stringify(trip, null, "\t")
  );
  const [filename, updateFilename] = React.useState(undefined);
  const [errors, updateErrors] = React.useState(undefined);

  React.useEffect(() => {
    if (JSON.stringify(trip) !== JSON.stringify(userJson))
      updateUserJson(JSON.stringify(trip, null, "\t"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  React.useEffect(() => {
    if (fetchError && fetchError !== errors) updateErrors({ fetchError });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError]);

  const validateInput = tripJSON => {
    const validationErrors = utils.validateInputJSON(tripJSON);
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
      updateErrors(error);
    }
  };

  const handleCloseModal = e => {
    updateUserJson(JSON.stringify(trip, null, "\t"));
    hideModal();
  };

  const handleFileUpload = event => {
    event && event.preventDefault();
    const fileReader = new FileReader();
    const file = event.target.files[0];
    updateFilename(file && file.name ? file.name : undefined);
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

  const handleBlurEvent = event => {
    event && event.preventDefault();
    const value = event.target.value;
    if (value)
      try {
        const tripJSON = JSON.parse(value);
        validateInput(tripJSON);
      } catch (error) {
        console.error(error);
        updateErrors(error);
      }
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
              onBlur={handleBlurEvent}
            />
            {errors ? (
              <div className={"error-table-container"}>
                {Array.isArray(errors) ? (
                  <HTMLTable className={"error-table"} bordered>
                    <caption>
                      There {errors.length > 1 ? "are" : "is an"}{" "}
                      {errors.length > 1 ? errors.length : ""} issue
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
                            <div className="table-content">
                              {error.dataPath}
                            </div>
                          </td>
                          <td>
                            <div className="table-content">{error.message}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </HTMLTable>
                ) : (
                  <div className="error-table error">
                    {errors.message ? errors.message : JSON.stringify(errors)}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <FileInput
              text={filename}
              buttonText={"Browse"}
              className="file-input"
              onInputChange={handleFileUpload}
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