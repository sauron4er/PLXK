import React from 'react';
import axios from "axios";
import querystring from "querystring";

export const getIndex = (id, array) => {
  for(let i = 0; i < array.length; i++) {
    if(array[i].id === id) {
      return i;
    }
  }
  return -1; //to handle the case where the value doesn't exist
};

export const uniqueArray = (arrArg) => {
  return arrArg.filter((item, index, self) => index == self.findIndex((t) => (t.id == item.id)))
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
      },
    }).then((response) => {
    }).catch(function (error) {
      console.log('errorpost: ' + error);
      return error;
    });
    return null;
  };
