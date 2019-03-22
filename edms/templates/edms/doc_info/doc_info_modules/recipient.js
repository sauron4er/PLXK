'use strict';
import React, {Fragment} from 'react';

class Recipient extends React.Component {
  
  render() {
    const {fieldName, recipient} = this.props;

    return (
      <Fragment>
        {fieldName}:
        <div className='font-italic ml-1'>
          {recipient.name}, {recipient.seat}
        </div>
      </Fragment>
    );
  }

  static defaultProps = {
    recipient: {},
    fieldName: 'Кому:'
  };
}

export default Recipient;
