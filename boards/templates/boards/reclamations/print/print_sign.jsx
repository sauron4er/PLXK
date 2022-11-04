'use strict';
import * as React from 'react';

class ReclamationPrintSign extends React.Component {
  render() {
    const {className, name, role, cols} = this.props;
  
    return (
      <div className={`col-${cols} d-flex flex-column`}>
        <If condition={role}>
          <div className='text-center font-italic'>{role}</div>
        </If>
        <If condition={name}>
          <div className='text-center font-weight-bold'>{name}</div>
        </If>
        <div className={`pb-3 border border-dark rounded ${className}`} style={{height: '50px'}}>
        </div>
      </div>
    );
  }
  
  static defaultProps = {
    role: '',
    name: '',
    className: '',
    cols: '12'
  }
}

export default ReclamationPrintSign;
