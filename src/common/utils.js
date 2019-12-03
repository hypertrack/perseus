import { classes } from "./";

const parseGeofenceMarker = marker => {
  const { arrival, geofence } = marker;
  const arrivalPoint = new classes.Point(arrival.location.geometry);
  const geofencePoint = new classes.Point(geofence.geometry);
  const arrivalTime = arrival.location.recorded_at;
  const geofenceId = geofence.geofence_id;
  const geofenceMetadata = JSON.stringify(geofence.metadata, null, 2);
  const radius = Number(geofence.radius);
  return {
    arrival: {
      arrivalPoint,
      arrivalTime
    },
    geofence: {
      geofencePoint,
      geofenceId,
      geofenceMetadata,
      radius
    }
  };
};

const getStartEndData = ({ recorded_at, location }) => {
  let acc = {};
  if (recorded_at) acc.timestamp = recorded_at;
  if (location && location.geometry)
    acc.location = new classes.Point(location.geometry);
  return acc;
};

const parseDeviceStatusMarker = marker => {
  const { activity, duration } = marker;
  const deviceStatus = marker.value;
  const end = getStartEndData(marker.end);
  const start = getStartEndData(marker.start);
  let extra = {};
  if (activity) extra.activity = activity;
  if (duration) extra.duration = duration;
  return { start, end, deviceStatus, ...extra };
};

const markerTypeMap = {
  geofence: parseGeofenceMarker,
  device_status: parseDeviceStatusMarker
};

const parseMarker = ({ type, data }) => markerTypeMap[type](data);

const iconMap = {
  stop: "cafe",
  walk: "pitch",
  run: "skiing",
  drive: "car",
  cycle: "bicycle",
  disconnected: "cross",
  inactive: "roadblock",
  active: "rocket"
};

const getIcon = (deviceStatus, activity, defaultIcon) =>
  iconMap[activity] || defaultIcon || iconMap[deviceStatus];

const markersByType = markers => type => {
  debugger;
  const allMarkers = markers.reduce(
    (markers, currentMarker) => ({
      ...markers,
      [currentMarker.type]: markers[currentMarker.type]
        ? [parseMarker(currentMarker), ...markers[currentMarker.type]]
        : [parseMarker(currentMarker)]
    }),
    {}
  );
  return type && allMarkers[type] ? allMarkers[type] : allMarkers;
};

const secondsToHms = d => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? h + " h " : "";
  const mDisplay = m > 0 ? m + " m " : "";
  const sDisplay = s > 0 ? s + " s" : "";
  return hDisplay + mDisplay + sDisplay;
};

export default {
  parseMarker,
  getIcon,
  secondsToHms,
  markersByType
};
