'use strict';
import * as React from 'react';
import SelectorWithFilterAndAxios from 'templates/components/form_modules/selectors/selector_with_filter_and_axios';
import useSetState from 'templates/hooks/useSetState';
import newDocStore from './new_doc_store';

function Department(props) {
  const [state, setState] = useSetState({
    department: 0,
    department_name: ''
  });

  function onDepartmentChange(e) {
    setState({
      department: e.id,
      department_name: e.name
    });

    newDocStore.new_document.department = e.id;
    newDocStore.new_document.department_name = e.name;
  }

  return (
    <SelectorWithFilterAndAxios
      listNameForUrl='departments/all'
      fieldName='* Відділ'
      selectId='department_select'
      value={{name: state.department_name, id: state.department}}
      onChange={onDepartmentChange}
      disabled={false}
    />
  );
}

Department.defaultProps = {};

export default Department;
