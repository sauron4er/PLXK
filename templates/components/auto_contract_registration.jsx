import {axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';

export const getTypeCode = (type) => {
  switch (type) {
    case 'Закупівля лісу':
      return '00';
    case 'Купівля-продаж':
      return '01';
    case 'Перевезення':
      return '02';
    case 'Послуги та інше':
      return '03';
    default:
      return '';
  }
};

export const getCompanyCode = (company) => {
  switch (company) {
    case 'ТДВ':
      return 'Р';
    case 'ТОВ':
      return 'Т';
    case 'NorthlandChem':
      return 'Н';
    default:
      return '';
  }
};

export async function getNextSequenceNumber(type, company, year, primary_contract_id=0) {
  let formData = new FormData();
  formData.append('type', type);
  formData.append('company', company);
  formData.append('year', year);
  formData.append('primary_contract_id', primary_contract_id);

  let nextSequenceNumber = ''

  await axiosPostRequest('get_next_sequence_number/', formData)
    .then((response) => {
      if (response) {
        nextSequenceNumber = response;
      }
    })
    .catch(function (error) {
      console.log(error);
      nextSequenceNumber = null;
    });

  return nextSequenceNumber;
}
