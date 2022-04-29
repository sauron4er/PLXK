import * as React from 'react';
import useSetState from 'templates/hooks/useSetState';

function CompanyChoose(props) {
  const [state, setState] = useSetState({
    name: '',
    company: props.company,
    commentary: ''
  });
  
  function onChange(e) {
    e.target.value === 'ТДВ' ? setState({company: 'ТДВ'}) : setState({company: 'ТОВ'});
    props.onChange(e.target.value)
  }

  return (
    <div>
      <span className='mr-1'>{props.fieldName}:</span>
      <input type='radio' name={`${props.id}radio`} value='ТДВ' id={`${props.id}_TDV`} onChange={onChange} checked={state.company === 'ТДВ'} />
      <label className='radio-inline mx-1' htmlFor={`${props.id}_TDV`}>
        {' '}
        ТДВ "ПЛХК"
      </label>
      <input className='ml-2' type='radio' name={`${props.id}radio`} value='ТОВ' id={`${props.id}_TOV`} onChange={onChange} checked={state.company === 'ТОВ'} />
      <label className='radio-inline mx-1' htmlFor={`${props.id}_TOV`}>
        {' '}
        ТОВ "ПЛХК"
      </label>
    </div>
  );
}

CompanyChoose.defaultProps = {
  fieldName: '',
  company: 'ТДВ',
  onChange: () => {},
  both: false,
  id: '1'
};

export default CompanyChoose;
