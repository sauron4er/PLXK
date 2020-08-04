'use strict';
import React from 'react';
import 'static/css/my_styles.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';

class List extends React.Component {
  // Компонент автоматично опрацьовує список файлів, для цього потрібно файли записувати у параметр files кожного пункту списку
  arrangeFiles = (files) => {
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
  };
  
  render() {
    const {list, mainField, sideFields, deleteItem, disabled} = this.props;
    return (
      <div className='mt-2'>
        <For each='item' index='id' of={list}>
          <If condition={item.status !== 'delete'}>
            <div key={item.id} className='css_selected_law'>
              <div>
                <div className='font-weight-bold'>{item[mainField]}</div>
                
                <For each='field' index='id' of={sideFields}>
                  <If condition={item[field]}>
                    <div>item[field]</div>
                  </If>
                </For>
                
                <If condition={item.files?.length}>
                  <div>Файли: {this.arrangeFiles(item.files)}</div>
                </If>
                
              </div>
              <button className='btn btn-sm btn-outline-secondary font-weight-bold ml-auto'
                      onClick={() => deleteItem(item.id)}
                      disabled={disabled}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </If>
        </For>
      </div>
    );
  }

  static defaultProps = {
    list: [],
    mainField: 'name',
    sideFields: [],
    deleteItem: () => {},
    arrangeFiles: () => {},
    disabled: true
  };
}

export default List;
