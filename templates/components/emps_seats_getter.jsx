import {axiosGetRequest} from 'templates/components/axios_requests';

export default function getEmpSeatsToLocalStorage() {
  axiosGetRequest('get_emp_seats/')
    .then((response) => {
      localStorage.setItem('emp_seat_list', JSON.stringify(response));
    })
    .catch((error) => console.log(error));
}
