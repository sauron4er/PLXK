import React from 'react';

export const getIndex = (id, array) => {
  for(let i = 0; i < array.length; i++) {
    if(array[i].id === id) {
      return i;
    }
  }
  return -1; //to handle the case where the value doesn't exist
};

export const uniqueArray = (arrArg) => {
  return arrArg.filter((item, index, self) => index === self.findIndex((t) => (t.id === item.id)))
};