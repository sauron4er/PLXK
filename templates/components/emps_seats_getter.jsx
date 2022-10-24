import {axiosGetRequest} from 'templates/components/axios_requests';

export default function getEmpSeatsFromLocalStorage() {
  // Запитуємо у сервера нові дані, а поки повертаємо клієнту старі.
  // Таким чином навіть якщо один раз клієнт отримає старі дані, то наступного разу вони вже будуть нові.
  let old_emp_seats_list = []
  if (localStorage.getItem("emp_seat_list") && localStorage.getItem("emp_seat_list") !== 'undefined') {
    old_emp_seats_list = JSON.parse(localStorage.getItem('emp_seat_list'));
  }

  axiosGetRequest('get_emp_seats/')
    .then((response) => {
      if (JSON.stringify(old_emp_seats_list) !== JSON.stringify(response)) {
        localStorage.setItem('emp_seat_list', JSON.stringify(response));
      }
    })
    .catch((error) => console.log(error));

  return old_emp_seats_list;
}
