import mapboxgl from "mapbox-gl";

const computeBounds = coordinates => {
	const point = new mapboxgl.LngLat(coordinates[0][0], coordinates[0][1]);
	const initBounds = new mapboxgl.LngLatBounds(point, point);
	return coordinates.reduce(
		(bounds, [lng, lat]) => bounds.extend(new mapboxgl.LngLat(lng, lat)),
		initBounds
	);
};

export default {
	computeBounds
};
