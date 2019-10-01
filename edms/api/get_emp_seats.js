import axios from 'axios';
import {compareById} from '../templates/edms/_else/my_extras';

export function getEmpSeats() {
  return new Promise(function(resolve, reject) {
    // Знаходимо новий список співробітників, і якщо він != кешованому, оновлюємо кеш і повертаємо результат
    axios({
      method: 'get',
      url: 'get_emp_seats/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        if (compareById(JSON.parse(localStorage.getItem('emp_seat_list')), response.data)) {
          resolve(0);
        } else {
          localStorage.setItem('emp_seat_list', JSON.stringify(response.data));
          resolve(response.data);
        }
      })
      .catch((error) => {
        reject(error)
      });
  })
}


// exports.getEmpSeats = getEmpSeats;