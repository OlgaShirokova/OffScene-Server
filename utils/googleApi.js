import axios from 'axios';
import nconf from '~/config/nconf';

export function getCoords(city) {
  return axios
    .get('https://maps.googleapis.com/maps/api/geocode/json?', {
      params: {
        address: city,
        key: nconf.get('GOOGLE_API_KEY'), // [WARNING] if the api key is outdated this function will fail silenty
      },
    })
    .then(({ data }) => ({
      lat: data.results[0].geometry.location.lat,
      long: data.results[0].geometry.location.lng,
    }))
    .catch(() => null);
}
