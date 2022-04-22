import React from 'react';
import useSetState from 'templates/hooks/useSetState';

function SubmitButton(props) {
  const [state, setState] = useSetState({
    clicked: false
  });
  
  function onClick() {
    setState({clicked: true});
    props.onClick();
    setTimeout(() => setState({clicked: false}), props.timeout)
  }
  
  return (
      <button className={'btn my-2 ' + props.className} onClick={onClick} disabled={props.disabled || state.clicked}>
        {props.text}
      </button>
    );
  
}

SubmitButton.defaultProps = {
    className: '',
    text: '???',
    onClick: () => {},
    disabled: false,
    timeout: 10000
  };

export default SubmitButton;
