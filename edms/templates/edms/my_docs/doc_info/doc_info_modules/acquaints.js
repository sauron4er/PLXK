'use strict';
import * as React from 'react';

class Acquaints extends React.Component {
  // отримує список користувачів в масиві flow, рендерить її для doc_info

  render() {
    return (
      <div>
        Документ на ознайомленні у:
        <For each='acquaint' index='id' of={this.props.acquaints}>
          <div key={acquaint.id} className='css_acquaint p-2 mt-1 mr-1'>
            <div className='font-weight-bold'>{acquaint.emp}</div>
            <div>{acquaint.seat}</div>
          </div>
        </For>
      </div>
    );
  }
  
  static defaultProps = {
    acquaints: [],
  }
}

export default Acquaints;
