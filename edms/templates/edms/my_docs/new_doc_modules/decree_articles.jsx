'use strict';
import React, {useEffect} from 'react';
import Select from 'react-select';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from './new_doc_store';
import SelectorWithFilterAndAxios from "templates/components/form_modules/selectors/selector_with_filter_and_axios";

function DecreeArticles(props) {
  
  function onSelectChange(e) {
    newDocStore.new_document.emp_seat = e.id;
    newDocStore.new_document.emp_seat_name = e.name;
  }

  return (
    <div>
      Decree Article
      <small className='text-danger'>{props.module_info?.additional_info}</small>
    </div>
  );
}

DecreeArticles.defaultProps = {
  module_info: {
    field_name: '---',
    queue: 0,
    required: false,
    additional_info: null
  }
};

export default view(DecreeArticles);
