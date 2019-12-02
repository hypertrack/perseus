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

const DeviceStatusTable = ({
  start,
  end,
  deviceStatus,
  activity,
  duration
}) => (
  <table className="device-status-table">
    <tr>
      <th colSpan={2} className="capitalize">
        {deviceStatus}
      </th>
    </tr>
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
  </table>
);

export default DeviceStatusTable;
