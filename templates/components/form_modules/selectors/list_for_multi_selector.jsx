'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';


function ListForMultiSelector(props) {
  
  function arrangeFiles(files) {
    return (
      <ul className='mb-0'>
        <For each='file' index='idx' of={files}>
          <li key={idx}>
            <a href={'../../media/' + file.file} target='_blank'>
              {file.name}{' '}
            </a>
          </li>
        </For>
      </ul>
    );
  }
  
  return (
    <For each='item' index='index' of={props.list}>
      <If condition={item.status !== 'delete'}>
        <li key={index} className="ml-3">
          {item.name}{" "}
          <button className="btn btn-sm btn-outline-secondary ml-1" onClick={() => props.delItem(index)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </li>
      </If>
    </For>
  );
}

ListForMultiSelector.defaultProps = {
  list: [],
  sideFields: [], // Назви полів, які теж мають відображатися
  delItem: () => {},
  disabled: false
};

export default ListForMultiSelector;
