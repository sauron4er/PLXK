import newDocStore from '../new_doc_store';
import {notify} from 'templates/components/my_extras';

export const areCostRatesValid = () => {
  console.log(1);
  const {type, accounting, product_type, product, date_start} = newDocStore.new_document.cost_rates;
  
  if (!type) notify('Оберіть тип норм витрат');
  else if (!accounting) notify('Оберіть тип обліку');
  else if (!product_type) notify('Оберіть вид продукції');
  else if (!date_start) notify('Оберіть дату введення в дію');
  else if (!product) notify('Оберіть тип продукції');
  else return areAllFieldsValid() && areAdditionalFieldsValid();
  return false;
};

function areAllFieldsValid() {
  const {fields} = newDocStore.new_document.cost_rates;
  if (!fields.length) {
    notify('Оберіть тип продукції');
    return false;
  }
  for (const i in fields) {
    if (fields[i].is_required) {
      if (!fields[i].term?.length) {
        notify(`Заповніть "Артикул" для виду витрат "${fields[i].name}"`);
        return false;
      }
      if (!fields[i].norm?.length) {
        notify(`Заповніть "Норма на 1 т." для виду витрат "${fields[i].name}"`);
        return false;
      }
    }
  }
  return true;
}

function areAdditionalFieldsValid() {
  const {additional_fields} = newDocStore.new_document.cost_rates;

  for (const i in additional_fields) {
    if (!additional_fields[i].name?.length) {
      notify(`Заповніть поле "Назва" для доданого виду витрат`);
      return false;
    }
    if (!additional_fields[i].unit?.length) {
      notify(`Заповніть поле "Одиниця виміру" для доданого виду витрат`);
      return false;
    }
    if (!additional_fields[i].term?.length) {
      notify(`Заповніть поле "Артикул 1С8" для доданого виду витрат`);
      return false;
    }
    if (!additional_fields[i].norm?.length) {
      notify(`Заповніть поле "Норма на 1 т." для доданого виду витрат`);
      return false;
    }
  }
  return true;
}
