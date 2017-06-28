import axios from 'axios';
import config from '~/config';

export function getCoords(city) {
  return axios
    .get('https://maps.googleapis.com/maps/api/geocode/json?', {
      params: {
        address: city,
        key: config.development.API_GOOGLE,
      },
    })
    .then(({ data }) => ({
      lat: data.results[0].geometry.location.lat,
      long: data.results[0].geometry.location.lng,
    }))
    .catch(() => null);
}
