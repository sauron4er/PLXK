'use strict';
import * as React from 'react';

class Resolutions extends React.Component {
  render() {
    const {path} = this.props;

    return (
      <div key='4' className='css_resolution mt-2'>
        Резолюції для вас:
        <For each='step' of={path}>
          <If condition={step.resolutions}>
            <For each='res' of={step.resolutions}>
              <If condition={res.emp_seat_id === parseInt(localStorage.getItem('my_seat'))}>
                <div key={res.id} className='mb-1'>
                  <div className='font-italic'>Автор:</div>
                  <div>{step.emp}</div>
                  <div className='font-italic'>Текст:</div>
                  <div>{res.comment}</div>
                  <hr />
                </div>
              </If>
            </For>
          </If>
        </For>
      </div>
    );
  }

  static defaultProps = {
    path: []
  };
}

export default Resolutions;
