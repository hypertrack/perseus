import React from "react";

import "./component.css";

const TripInfoModal = ({ trip }) => {
	return (
		<div className="trip-info-modal">{JSON.stringify(trip, null, "\n")}</div>
	);
};

export default TripInfoModal;
