import React from 'react';

export const getIndex = (id, array) => {
    for(let i = 0; i < array.length; i++) {
        if(array[i].id === id) {
            return i;
        }
    }
    return -1; //to handle the case where the value doesn't exist
};