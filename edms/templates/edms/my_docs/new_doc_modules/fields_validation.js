import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

export const isRegNumberFree = (reg_number) => {
  const reg_number_cleared = reg_number.replace(/\s+/g, ' ').trim()
  
  let formData = new FormData();
  formData.append('reg_number', reg_number_cleared);
  
  axiosPostRequest(`is_reg_num_free`, formData)
    .then((response) => {
      return response === 'True'
    })
    .catch((error) => {
      notify(error);
    });
};