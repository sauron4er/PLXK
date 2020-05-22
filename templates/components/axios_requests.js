import axios from 'axios';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

export const axiosPostRequest = (url, data = []) => {
  return axios({
    method: 'post',
    url: url,
    data: data,
  })
    .then((response) => response.data)
    .catch((error) => {
      console.log('errorpost: ' + error);
      throw error;
    });
};

export const axiosGetRequest = (url, data) => {
  return axios({
    method: 'get',
    url: url,
  })
    .then((response) => response.data)
    .catch((error) => {
      console.log('errorpost: ' + error);
      throw error;
    });
};
