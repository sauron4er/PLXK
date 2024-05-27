'use strict';
import * as React from 'react';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import SelectorWithFilter from 'templates/components/form_modules/selectors/selector_with_filter';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import useSetState from 'templates/hooks/useSetState';
import newDocStore from './new_doc_store';

function Department(props) {
  function onDepartmentChange(e) {
    newDocStore.new_document.department = e.id;
    newDocStore.new_document.department_name = e.name;
  }

  return (
    <SelectorWithFilterAndAxios
      listNameForUrl='departments/all'
      fieldName='Відділ'
      selectId='department_select'
      value={{name: newDocStore.new_document.department_name, id: newDocStore.new_document.department}}
      onChange={onDepartmentChange}
      disabled={false}
    />
  );
}

Department.defaultProps = {};

export default Department;
