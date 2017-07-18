export function distToDegreeLat(dist) {
  return dist / 110.54;
}

export function distToDegreeLon(dist, lat) {
  return dist / (111.32 * Math.cos(lat));
}
