import React from 'react';
import axios from 'axios';
import querystring from 'querystring';
import {getEmpSeats} from '../../../api/get_emp_seats';

export const getIndex = (id, array) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i].id === id) {
      return i;
    }
  }
  return -1; //to handle the case where the value doesn't exist
};

export const uniqueArray = (arrArg) => {
  return arrArg.filter((item, index, self) => index == self.findIndex((t) => t.id == item.id));
  // спеціально == а не ===, бо в js id - string, а сервер висилає integer
};

// видаляє ччернетку з бази даних
export const delDraft = (doc_id) => {
  axios({
    method: 'post',
    url: 'del_draft/' + doc_id + '/',
    data: querystring.stringify({}),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then((response) => {})
    .catch(function(error) {
      console.log('errorpost: ' + error);
      return error;
    });
  return null;
};

export const compareById = (a, b) => {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) {
      return false;
    }
  }
  return true;
};

export const getEmpSeatList = () => {
  const cached_emp_seat_list = JSON.parse(localStorage.getItem('emp_seat_list'));
  // Знаходимо новий список співробітників, і якщо він != кешованому, оновлюємо кеш і повертаємо результат
  const get_emp_seats = getEmpSeats();
  get_emp_seats.then((result) => {
    if (!compareById(JSON.parse(localStorage.getItem('emp_seat_list')), result)) {
      localStorage.setItem('emp_seat_list', JSON.stringify(result));
      return result;
    }
    return 0;
  });
};
