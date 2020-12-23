'use strict';
import * as React from 'react';

class SubmitButton extends React.Component {
  state = {
    clicked: false
  }
  
  onClick = () => {
    this.setState({clicked: true});
    this.props.onClick();
    setTimeout(() => this.setState({clicked: false}), 10000)
  };
  
  render() {
    const {text, className} = this.props;
    const {clicked} = this.state;

    return (
      <button className={'btn my-2 ' + className} onClick={() => this.onClick()} disabled={clicked}>
        {text}
      </button>
    );
  }

  static defaultProps = {
    className: '',
    text: '???',
    onClick: () => {}
  };
}

export default SubmitButton;
