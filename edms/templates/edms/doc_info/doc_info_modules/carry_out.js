'use strict';
import React, {Fragment} from 'react';

class CarryOut extends React.Component {
  render() {
    const {fieldName, carryOutItems} = this.props;

    return (
      <table className='table table-bordered mt-2'>
        <thead>
          <tr>
            <th>№</th>
            <th>Найменування</th>
            <th>К-сть</th>
            <th>Од. виміру</th>
          </tr>
        </thead>
        <tbody>
          <For each='item' index='idx' of={carryOutItems}>
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{item.item_name}</td>
              <td>{item.quantity}</td>
              <td>{item.measurement}</td>
            </tr>
          </For>
        </tbody>
      </table>
    );
  }

  static defaultProps = {
    carryOutItems: [],
    fieldName: '???'
  };
}

export default CarryOut;
