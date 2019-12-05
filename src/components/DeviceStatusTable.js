import React from "react";

import { utils } from "./../common";

import "./component.css";

const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec"
];

const formatDate = timestamp =>
  months[timestamp.getMonth()] +
  " " +
  timestamp.getDate() +
  ", " +
  timestamp.getFullYear() +
  " " +
  timestamp.getHours() +
  ":" +
  timestamp.getMinutes() +
  ":" +
  timestamp.getSeconds();

const rowMap = {
  deviceStatusMarker: ({ start, end, deviceStatus, activity, duration }) => (
    <tbody>
      {start ? (
        <tr className="capitalize">
          <td>Start Time</td>
          <td>{formatDate(new Date(start.timestamp))}</td>
        </tr>
      ) : null}
      {end ? (
        <tr className="capitalize">
          <td>End Time</td>
          <td>{formatDate(new Date(end.timestamp))}</td>
        </tr>
      ) : null}
      {duration ? (
        <tr>
          <td>Duration</td>
          <td>{utils.secondsToHms(duration)}</td>
        </tr>
      ) : null}
      {activity ? (
        <tr>
          <td>Activity</td>
          <td className="capitalize">{activity}</td>
        </tr>
      ) : null}
    </tbody>
  ),
  locationMarker: ({ coordinates: [lat, lng], alt, recorded_at }) => (
    <tbody>
      <tr>
        <td>Coordinates</td>
        <td className="capitalize">
          {lat} {lng}
        </td>
      </tr>
      {alt ? (
        <tr>
          <td>Altitude</td>
          <td className="capitalize">{alt}</td>
        </tr>
      ) : null}
      {recorded_at ? (
        <tr>
          <td>Recorded at</td>
          <td className="capitalize">{formatDate(new Date(recorded_at))}</td>
        </tr>
      ) : null}
    </tbody>
  )
};

const headerMap = {
  locationMarker: () => "location",
  deviceStatusMarker: ({ deviceStatus }) => deviceStatus
};

const DeviceStatusTable = ({ type, ...props }) => (
  <table className="device-status-table">
    <thead>
      <tr>
        <th colSpan={2} className="capitalize">
          {headerMap[type](props)}
        </th>
      </tr>
    </thead>
    {rowMap[type](props)}
  </table>
);

export default DeviceStatusTable;
