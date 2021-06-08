'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faPlus, faSave, faTimes} from '@fortawesome/free-solid-svg-icons';
import {view, store} from '@risingstack/react-easy-state';
import newDocStore from '../new_doc_store';
import {isBlankOrZero, notify} from 'templates/components/my_extras';
import counterpartyStore from 'boards/templates/boards/counterparty/components/counterparty_store';
import {axiosPostRequest} from 'templates/components/axios_requests';

class AdditionalRequirement extends React.Component {
  state = {
    name: '',
    requirement: '',
    saved: 'false'
  };

  isNameFieldFilled = () => {
    if (isBlankOrZero(this.props.ar.name)) {
      notify('Заповніть поле "Назва показника"');
      return false;
    }
    return true;
  };

  onNameChange = (e) => {
    this.props.changeAR(this.props.index, e.target.value, this.props.ar.requirement);
  };

  onRequirementChange = (e) => {
    this.props.changeAR(this.props.index, this.props.ar.name, e.target.value);
  };

  changeSaveButtonValue = () => {
    this.setState({saved: true}, () => {
      setTimeout(() => {
        this.setState({saved: false});
      }, 5000);
    });
  };

  getSaveButton = () => {
    if (this.props.ar.id === 0) return <FontAwesomeIcon icon={faPlus} />;
    else {
      if (this.state.saved === true) return <FontAwesomeIcon icon={faCheck} />;
    }
    return <FontAwesomeIcon icon={faSave} />;
  };

  deleteAR = () => {
    newDocStore.new_document.client_requirements.additional_requirements.splice(this.props.index, 1);
  };

  render() {
    const {ar, index} = this.props;
    const ars_length = newDocStore.new_document.client_requirements.additional_requirements.length;
    const {addBlankAdditionalRequirement} = newDocStore;

    return (
      <div className='d-flex mb-1'>
        <input
          className='form-control mr-1'
          id={ar.id + '_name'}
          value={ar.name}
          onChange={this.onNameChange}
          placeholder='Назва'
          maxLength={200}
        />

        <input
          className='form-control mr-1'
          id={ar.id + '_end'}
          value={ar.requirement}
          onChange={this.onRequirementChange}
          placeholder='Показник'
          maxLength={50}
        />

        <button onClick={() => this.deleteAR()} className='btn btn-sm btn-outline-dark mr-1'>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <If condition={index + 1 === ars_length}>
          <button onClick={() => addBlankAdditionalRequirement()} className='btn btn-sm btn-outline-dark'>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </If>
      </div>
    );
  }

  static defaultProps = {
    index: 0,
    changeAR: () => {},
    ar: {id: 0, name: '', requirement: ''}
  };
}

export default view(AdditionalRequirement);
