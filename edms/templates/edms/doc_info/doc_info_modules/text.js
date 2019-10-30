'use strict';
import React, {Fragment} from 'react';

class Text extends React.Component {

  render() {
    const {fieldName, text} = this.props;

    return (
      <Fragment>
        <div>{fieldName}:</div>
        <div className='css_note_text ml-1'>{text}</div>
      </Fragment>
    );
  }

  static defaultProps = {
    text: '---',
    fieldName: '---',
    queue: 0
  };
}

export default Text;
