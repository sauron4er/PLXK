'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.min.css';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class Vacations extends React.Component {
  state = {
    opened: false,
    start_vacations_arrange_button_label: 'Запустити обробку відпусток'
  };

  startVacationsArrange = () => {
    axios({
      method: 'get',
      url: 'start_vacations_arrange/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        if (response.status === 200) {
          this.setState({start_vacations_arrange_button_label: 'Запущено'})
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  openModal = () => {
    this.setState({opened: true});
  };

  closeModal = () => {
    this.setState({opened: false});
  };

  render() {
    const {opened, start_vacations_arrange_button_label} = this.state;
    return (
      <>
        <button
          type='button'
          className='btn btn-sm btn-outline-secondary mb-1 float-right'
          onClick={this.openModal}
        >
          Відпустки
        </button>

        <Modal open={opened} onClose={this.closeModal} center>
          <div className='modal-header'> </div>
          <div className='modal-body'> </div>
          <div className='modal-footer'>
            <If condition={true}>
              <button
                type='button'
                className='btn btn-sm btn-outline-secondary mb-1 float-left'
                onClick={this.startVacationsArrange}
              >
                {start_vacations_arrange_button_label}
              </button>
            </If>
          </div>
        </Modal>
      </>
    );
  }

  static defaultProps = {};
}

export default Vacations;
