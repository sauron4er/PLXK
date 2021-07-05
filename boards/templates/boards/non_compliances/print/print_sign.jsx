'use strict';
import * as React from 'react';

class NCPrintSign extends React.Component {
  render() {
    const {className, name, role, role_en, cols} = this.props;
  
    return (
      <div className={`col-${cols} d-flex flex-column`}>
        <If condition={role}>
          <div className='text-center font-italic'>{role} <small>/ {role_en}</small></div>
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
    role_en: '',
    name: '',
    className: '',
    cols: '12'
  }
}

export default NCPrintSign;
