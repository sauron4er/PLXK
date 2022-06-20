import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';

class CostRatesItem extends React.Component {
  onChange = (e) => {
    newDocStore.new_document.cost_rates.fields[this.props.name] = e.target.value;
  };
  
  onTermChange = (e) => {
    newDocStore.new_document.cost_rates.fields[this.props.index].term = e.target.value;
  }
  
  onNormChange = (e) => {
    newDocStore.new_document.cost_rates.fields[this.props.index].norm = e.target.value;
  }
  
  onCommentChange = (e) => {
    newDocStore.new_document.cost_rates.fields[this.props.index].comment = e.target.value;
  }

  render() {
    const {name, unit, isRequired} = this.props;
    const {fields} = newDocStore.new_document.cost_rates;

    return (
      <div>
        <div className='css_edms_client_requirement'>
          <div>
            <small>
              <If condition={isRequired}>* </If>
              {name}
            </small>
          </div>
          <div className='mr-auto'>
            <small className='font-italic'>Одиниця виміру: {unit}</small>
          </div>
          <table className='table w-auto small'>
            <thead className='thead-light'>
              <tr>
                <th>Артикул 1С8</th>
                <th>Норма на 1 т.</th>
                <th>Коментар</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="text" name="term_1c8" onChange={this.onTermChange} /></td>
                <td><input type="text" name="norm" onChange={this.onNormChange} /></td>
                <td><input type="text" name="comment" onChange={this.onCommentChange} /></td>
              </tr>
            </tbody>
          </table>
          {/*<input*/}
          {/*  className='form-control'*/}
          {/*  name={name}*/}
          {/*  id={name}*/}
          {/*  value={fields[name]}*/}
          {/*  onChange={this.onChange}*/}
          {/*  maxLength={10}*/}
          {/*/>*/}
        </div>
      </div>
    );
  }

  static defaultProps = {
    index: -1,
    name: '',
    unit: '',
    isRequired: true
  };
}

export default view(CostRatesItem);
