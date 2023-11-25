import React, {useEffect} from 'react';
import useSetState from 'templates/hooks/useSetState';
import {LoaderMini, LoaderSmall} from 'templates/components/loaders';

function SubmitButton(props) {
  const [state, setState] = useSetState({
    clicked: false
  });

  function onClick() {
    setState({clicked: true});
    props.onClick();
  }

  useEffect(() => {
    if (state.clicked && !props.requestSent) {
      const timer = setTimeout(() => setState({clicked: false}), props.timeout);
      return () => clearTimeout(timer);
    }
  }, [state.clicked]);
  
  useEffect(() => {
    if (!props.requestSent) setState({clicked: false})
  }, [props.requestSent])

  return (
    <button className={'btn my-2 p-1 ' + props.className} onClick={onClick} disabled={state.clicked || props.disabled}>
      <Choose>
        <When condition={props.requestSent}>
          <LoaderMini />
        </When>
        <When condition={props.text === 'save_icon'}>
          <img src={`${window.location.origin}/static/img/save.svg`} alt="Save" width='25px'/>
        </When>
        <Otherwise>{props.text}</Otherwise>
      </Choose>
    </button>
  );
}

SubmitButton.defaultProps = {
  className: '',
  text: '???',
  onClick: () => {},
  disabled: false,
  timeout: 5000,
  requestSent: false // Означає, що пішов запит до сервера і нажимати на кнопку в очікуванні не можна
};

export default SubmitButton;
