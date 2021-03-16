'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import counterpartyStore from '../../components/counterparty_store';
import {faSave, faPlus, faTimes, faCheck} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {isBlankOrZero, notify} from 'templates/components/my_extras';

class CertificatePause extends React.Component {
  state = {
    start: '',
    end: '',
    saved: 'false'
  };

  isStartFieldFilled = () => {
    if (isBlankOrZero(this.props.pause.start)) {
      notify('Заповніть поле "Дата початку"');
      return false;
    }
    return true;
  };

  onStartChange = (e) => {
    this.props.changePause(this.props.index, e.target.value, this.props.pause.end);
  };

  onEndChange = (e) => {
    this.props.changePause(this.props.index, this.props.pause.start, e.target.value);
  };

  postChanges = () => {
    if (this.isStartFieldFilled()) {
      let formData = new FormData();
      let pause = {...this.props.pause};
      pause.end = pause.end !== '' ? pause.end : null;
      formData.append('pause', JSON.stringify(pause));
      formData.append('certificate_id', counterpartyStore.certificate.id);

      axiosPostRequest('post_certificate_pause/', formData)
        .then((response) => {
          if (pause.id === 0) {
            counterpartyStore.certificate.pauses.splice(1, 0, pause);
            counterpartyStore.certificate.pauses[0].start = '';
            counterpartyStore.certificate.pauses[0].end = '';
          }
          this.changeSaveButtonValue();
          counterpartyStore.changeCertificateStatus();
        })
        .catch((error) => notify(error));
    }
  };

  deactivatePause = () => {
    axiosPostRequest('deact_cert_pause/' + this.props.pause.id + '/')
      .then((response) => {
        counterpartyStore.certificate.pauses.splice(this.props.index, 1);
        counterpartyStore.changeCertificateStatus()
      })
      .catch((error) => notify(error));
  };

  changeSaveButtonValue = () => {
    this.setState({saved: true}, () => {
      setTimeout(() => {
        this.setState({saved: false});
      }, 5000);
    });
  };

  getSaveButton = () => {
    if (this.props.pause.id === 0) return <FontAwesomeIcon icon={faPlus} />;
    else {
      if (this.state.saved === true) return <FontAwesomeIcon icon={faCheck} />;
    }
    return <FontAwesomeIcon icon={faSave} />;
  };

  render() {
    const {edit_access} = window;
    const {pause} = this.props;

    return (
      <tr>
        <td>
          <input
            className='form-control'
            id={pause.id + '_start'}
            type='date'
            value={pause.start}
            onChange={this.onStartChange}
            disabled={!edit_access}
          />
        </td>
        <td>
          <input
            className='form-control'
            id={pause.id + '_end'}
            type='date'
            value={pause.end}
            onChange={this.onEndChange}
            disabled={!edit_access}
          />
        </td>
        <td>
          <button onClick={() => this.postChanges()} className='btn btn-sm btn-outline-dark' disabled={!edit_access}>
            {this.getSaveButton()}
          </button>
          <If condition={pause.id !== 0}>
            <button onClick={() => this.deactivatePause()} className='btn btn-sm btn-outline-dark ml-1' disabled={!edit_access}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </If>
        </td>
      </tr>
    );
  }

  static defaultProps = {
    index: 0,
    changePause: () => {},
    pause: {id: 0, start: '', end: ''}
  };
}

export default view(CertificatePause);
