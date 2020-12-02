'use strict';
import * as React from 'react';

class Flow extends React.Component {
  // отримує список користувачів в масиві flow, рендерить її для doc_info

  render() {
    return (
      <div>
        Документ на черзі у:
        <For each='flow' index='id' of={this.props.flow}>
          <div key={flow.id} className='css_flow p-2 mt-1 mr-1'>
            <div className='font-weight-bold'>{flow.emp}</div>
            <div>{flow.seat}</div>
          </div>
        </For>
      </div>
    );
  }
  
  static defaultProps = {
    flow: [],
  }
}

export default Flow;
