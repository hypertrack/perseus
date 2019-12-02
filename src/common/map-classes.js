class Line {
  constructor({ type, coordinates }) {
    this.type = type;
    this.coordinates = coordinates;
  }
}

class Point {
  constructor({ type, coordinates }) {
    this.type = type;
    this.coordinates = coordinates;
  }
}

export default {
  Line,
  Point
};
