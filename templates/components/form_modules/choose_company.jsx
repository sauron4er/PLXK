import * as React from 'react';
import useSetState from "templates/hooks/useSetState";

function CompanyChoose(props) {
  const [state, setState] = useSetState({
    name: '',
    company: '',
    commentary: ''
  });

  return (
      <div className='mt-1'>
        <label className='mr-1'>{props.fieldName}:</label>
        <input type="radio" name="gate_radio" value='ТДВ' id='TDV' onChange={props.onChange} checked={state.company === 'ТДВ'} />
        <label className="radio-inline mx-1" htmlFor='TDV'> ТДВ "ПЛХК"</label>
        <input type="radio" name="gate_radio" value='ТОВ' id='TOV' onChange={props.onChange} checked={state.company === 'ТОВ'} />
        <label className="radio-inline mx-1" htmlFor='TOV'> ТОВ "ПЛХК"</label>
      </div>
    );
  
}

CompanyChoose.defaultProps = {
    fieldName: '',
    onChange: () => {}
  };

export default CompanyChoose;
