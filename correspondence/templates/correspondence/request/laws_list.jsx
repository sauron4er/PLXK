'use strict';
import React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import corrStore from '../store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import 'static/css/my_styles.css';

class LawsList extends React.Component {
  delLaw = (id) => {
    for (const i in corrStore.request.laws) {
      if (corrStore.request.laws.hasOwnProperty(i) && corrStore.request.laws[i].id === id) {
        corrStore.request.laws[i].status = 'delete';
      }
    }
  };

  arrangeLawFiles = (files) => {
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
    return (
      <div className='mt-2'>
        <For each='law' index='id' of={corrStore.request.laws}>
          <If condition={law.status !== 'delete'}>
            <div key={law.id} className='css_selected_law'>
              <div>
                <div className='font-weight-bold'>{law.name}</div>
                <div>
                  Посилання:{' '}
                  <a href={law.url} target='_blank'>
                    {law.url}
                  </a>
                </div>
                <If condition={law.files?.length}>
                  <div>Файли: {this.arrangeLawFiles(law.files)}</div>
                </If>
              </div>
              <button
                className='btn btn-sm btn-outline-secondary font-weight-bold ml-auto'
                onClick={() => this.delLaw(law.id)}
              >
                <FontAwesomeIcon icon={faTimes}/>
              </button>
            </div>
          </If>
        </For>
      </div>
    );
  }

  static defaultProps = {
    laws: []
  };
}

export default view(LawsList);
