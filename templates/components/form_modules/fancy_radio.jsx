'use strict';
import * as React from 'react';
import 'static/css/fancy_radio.css';

class FancyRadio extends React.Component {
  render() {
    const {items, active, onChange} = this.props;
    return (
      <For each='item' of={items} index='idx'>
        <div key={idx}>
          <input
            className='checkbox-tools'
            type='radio'
            name={item[0]}
            id={`radio_${item[0]}`}
            onChange={onChange}
            checked={active === item[0]}
          />
          <label className='for-checkbox-tools' htmlFor={`radio_${item[0]}`}>
            {item[1]}
          </label>
        </div>
      </For>
    );
  }

  static defaultProps = {
    items: ['id', 'label'],
    active: '1',
    onChange: () => {}
  };
}

export default FancyRadio;
