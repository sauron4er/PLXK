'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faPlus, faSave, faTimes} from '@fortawesome/free-solid-svg-icons';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import {isBlankOrZero, notify} from 'templates/components/my_extras';

class AdditionalCostRate extends React.Component {
  state = {
    saved: 'false'
  };

  areEssentialFieldsFilled = () => {
    const acr = newDocStore.new_document.cost_rates.additional_fields[this.props.index];
    if (isBlankOrZero(acr.name)) {
      notify('Заповніть поле "Назва показника" в доданій нормі');
      return false;
    }
    if (isBlankOrZero(acr.unit)) {
      notify('Заповніть поле "Одиниця виміру" в доданій нормі');
      return false;
    }
    if (isBlankOrZero(acr.term)) {
      notify('Заповніть поле "Артикул 1С8" в доданій нормі');
      return false;
    }
    if (isBlankOrZero(acr.norm)) {
      notify('Заповніть поле "Норма на 1 т." в доданій нормі');
      return false;
    }
    return true;
  };

  onChange = (e) => {
    newDocStore.new_document.cost_rates.additional_fields[this.props.index][e.target.name] = e.target.value;
  };

  getSaveButton = () => {
    if (newDocStore.new_document.cost_rates.additional_fields[this.props.index].id === 0) return <FontAwesomeIcon icon={faPlus} />;
    else {
      if (this.state.saved === true) return <FontAwesomeIcon icon={faCheck} />;
    }
    return <FontAwesomeIcon icon={faSave} />;
  };

  deleteACR = () => {
    newDocStore.new_document.cost_rates.additional_fields.splice(this.props.index, 1);
  };

  addBlankAdditionalCostRate = () => {
    newDocStore.new_document.cost_rates.additional_fields.push({id: 0, name: '', unit: '', term: '', norm: '', comment: ''});
  };

  render() {
    const {index} = this.props;
    const acr = newDocStore.new_document.cost_rates.additional_fields[this.props.index];
    const acrs_length = newDocStore.new_document.cost_rates.additional_fields.length;

    return (
      <div className='css_edms_doc_module'>
        <div className='d-flex mb-1'>
          <input
            className='form-control mr-1'
            name='name'
            id={acr.id + '_name'}
            value={acr.name}
            onChange={this.onChange}
            placeholder='Назва'
            maxLength={100}
          />

          <div className='d-flex ml-auto'>
            <button onClick={() => this.deleteACR()} className='btn btn-sm btn-outline-dark mr-1'>
              <span className='text-danger'><FontAwesomeIcon icon={faTimes} /></span>
            </button>
            <If condition={index + 1 === acrs_length}>
              <button onClick={() => this.addBlankAdditionalCostRate()} className='btn btn-sm btn-outline-dark'>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </If>
          </div>
        </div>

        <table className='table w-auto small'>
          <thead className='thead-light'>
            <tr>
              <th>Артикул 1С8</th>
              <th>Норма на 1 т.</th>
              <th>Одиниця виміру</th>
              <th>Коментар</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type='text' name='term' maxLength={10} onChange={this.onChange} />
              </td>
              <td>
                <input type='text' name='norm' maxLength={10} onChange={this.onChange} />
              </td>
              <td>
                <input type='text' name='unit' maxLength={10} onChange={this.onChange} />
              </td>
              <td>
                <input type='text' name='comment' maxLength={200} onChange={this.onChange} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  static defaultProps = {
    index: 0
  };
}

export default view(AdditionalCostRate);
