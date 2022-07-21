'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import 'static/css/fancy_radio.css';

class FancyRadio extends React.Component {
  onChange = (e) => {
  
  };

  render() {
    return (
      <>
        <div className='row align-items-center mr-lg-1'>
          <div className='z-bigger'>
            <div className='col-12 pb-5'>
              <input
                className='checkbox-tools'
                type='radio'
                name='requirements_type'
                id='DV'
                onChange={this.onChange}
                checked={true}
              />
              <label className='for-checkbox-tools' htmlFor='DV'>
                ДВ
              </label>
              <input
                className='checkbox-tools'
                type='radio'
                name='requirements_type'
                id='DVB'
                onChange={this.onChange}
                checked={false}
              />
              <label className='for-checkbox-tools' htmlFor='DVB'>
                ДВБ
              </label>
              <input
                className='checkbox-tools'
                type='radio'
                name='requirements_type'
                id='ETA'
                onChange={this.onChange}
                checked={false}
              />
              <label className='for-checkbox-tools' htmlFor='ETA'>
                ЕТА
              </label>
              <input
                className='checkbox-tools'
                type='radio'
                name='requirements_type'
                id='KFS'
                onChange={this.onChange}
                checked={false}
              />
              <label className='for-checkbox-tools' htmlFor='KFS'>
                КФС
              </label>
              <input
                className='checkbox-tools'
                type='radio'
                name='requirements_type'
                id='MKFS'
                onChange={this.onChange}
                checked={false}
              />
              <label className='for-checkbox-tools' htmlFor='MKFS'>
                МКФС
              </label>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default view(FancyRadio);
