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

export const axiosGetRequest = (url) => {
  return axios({
    method: 'get',
    url: url
  })
    .then((response) => response.data)
    .catch((error) => {
      console.log('error message: ' + error.response.data);
      console.log('error: ' + error);
      throw error;
    });
};

export const axiosGetFileRequest = (url, file_name='file') => {
  return axios
    .post(url, [], {
      headers: {
        'Content-Disposition': 'attachment; filename=template.xlsx',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, x-xsrf-token'
      },
      responseType: 'arraybuffer'
    })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file_name);
      document.body.appendChild(link);
      link.click();
    })
    .catch((error) => {
      console.log('error message: ' + error.response.data);
      console.log('error: ' + error);
      throw error;
    });
};
