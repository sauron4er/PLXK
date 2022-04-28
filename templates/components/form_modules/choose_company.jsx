import * as React from 'react';
import useSetState from 'templates/hooks/useSetState';
import 'css/radio.css'

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
    <div className="wrapper">
      <input type="radio" name="select" id="option-1" checked />
        <input type="radio" name="select" id="option-2" />
          <label htmlFor="option-1" className="option option-1">
            <div className="dot"></div>
            <span>Student</span>
          </label>
          <label htmlFor="option-2" className="option option-2">
            <div className="dot"></div>
            <span>Teacher</span>
          </label>
    </div>
    
    // <div className='mt-1'>
    //   <label className='mr-1'>{props.fieldName}:</label>
    //   <input type='radio' name='gate_radio' value='ТДВ' id='TDV' onChange={onChange} checked={state.company === 'ТДВ'} />
    //   <label className='radio-inline mx-1' htmlFor='TDV'>
    //     {' '}
    //     ТДВ "ПЛХК"
    //   </label>
    //   <input className='ml-2' type='radio' name='gate_radio' value='ТОВ' id='TOV' onChange={onChange} checked={state.company === 'ТОВ'} />
    //   <label className='radio-inline mx-1' htmlFor='TOV'>
    //     {' '}
    //     ТОВ "ПЛХК"
    //   </label>
    // </div>
  );
}

CompanyChoose.defaultProps = {
  fieldName: '',
  company: 'ТДВ',
  onChange: () => {},
  both: false
};

export default CompanyChoose;
