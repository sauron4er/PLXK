'use strict';
import React from 'react';

class Day extends React.Component {
  
  getBackground = () => {
    switch (this.props.status) {
      case 'good':
        return 'bg-success'
      case 'alert':
        return 'bg-warning'
      case 'danger':
        return 'bg-danger'
      default:
        return ''
    }
  }
  
  render() {
    const {fieldName, day} = this.props;

    return (
      <>
        <div>{fieldName}:</div>
        <div className={`css_note_text ${this.getBackground()}`}>{day}</div>
      </>
    );
  }

  static defaultProps = {
    day: '---',
    fieldName: '1111-11-11',
    status: ''
  };
}

export default Day;
