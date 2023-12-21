import * as React from 'react';
import useSetState from 'templates/hooks/useSetState';

function Radio(props) {
  const [state, setState] = useSetState({
    checked_option: props.defaultOption
  });
  
  function onChange(e) {
    setState({checked_option: e.target.value})
    props.onChange(e.target.value)
  }

  return (
    <div className={`css_toggle ${props.className}`} key={props.id}>
      <span className='mr-1'>{props.fieldName}:</span>
      <For each='option' of={props.options} index='toggle_index'>
        <input
          type='radio'
          name={`${props.id}_toggle`}
          value={option.name}
          id={`${props.id}_${option.name}`}
          onChange={onChange}
          checked={state.checked_option === option.name}
        />
        <label className='radio-inline ml-1 mr-2' htmlFor={`${props.id}_${option.name}`}>
          {option.value}
        </label>
      </For>
    </div>
  );
}

Radio.defaultProps = {
  fieldName: '',
  onChange: () => {},
  options: [{ name: 'first', value: "1" },
          { name: 'second', value: "2" }],
  defaultOption: 'first',
  id: '1',
  className: ''
};

export default Radio;
