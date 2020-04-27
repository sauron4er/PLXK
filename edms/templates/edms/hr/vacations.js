'use strict';
import React from 'react';
import Modal from 'react-responsive-modal';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {getIndex} from 'templates/components/my_extras';
import querystring from 'querystring';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded, x-xsrf-token';

class Vacations extends React.Component {
  state = {
    opened: false,
    vacations_list: []
  };

  getVacationsList() {
    axios({
      method: 'get',
      url: 'get_vacations/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.setState({
          vacations_list: response.data
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  startVacationsArrange = () => {
    axios({
      method: 'get',
      url: 'start_vacations_arrange/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        window.location.reload();
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  delVacation = (e, id) => {
    e.preventDefault();

    const {vacations_list} = this.state;
    const index = getIndex(id, vacations_list);
    vacations_list.splice(index, 1);
    this.setState({vacations_list});

    this.postDeactivateVacation(id);
  };

  postDeactivateVacation = (vacation_id) => {
    axios({
      method: 'post',
      url: 'deactivate_vacation/' + vacation_id + '/',
      data: querystring.stringify({
        id: vacation_id
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  };

  openModal = () => {
    this.setState({opened: true});
    this.getVacationsList();
  };

  closeModal = () => {
    this.setState({opened: false});
  };

  render() {
    const {opened, vacations_list} = this.state;
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
          <div className='modal-body'>
            <If condition={vacations_list.length > 0}>
              <table className='table table-sm table-striped table-bordered'>
                <thead>
                  <tr>
                    <th className='text-center'>
                      <small>Початок</small>
                    </th>
                    <th className='text-center'>
                      <small>Кінець</small>
                    </th>
                    <th className='text-center'>
                      <small>Ф.І.О.</small>
                    </th>
                    <th className='text-center'>
                      <small>В.о.</small>
                    </th>
                    <th className='text-center'> </th>
                  </tr>
                </thead>
                <tbody>
                  <For each='vacation' index='idx' of={vacations_list}>
                    <tr key={idx} className={vacation.started ? 'bg-success' : ''}>
                      <td className='text-center align-middle small'>{vacation.begin}</td>
                      <td className='text-center align-middle small'>{vacation.end}</td>
                      <td className='text-center align-middle small'>{vacation.employee}</td>
                      <td className='text-center align-middle small'>{vacation.acting}</td>
                      <td className='text-center align-middle small text-danger'>
                        <button
                          className='btn btn-sm btn-link py-0'
                          onClick={(e) => this.delVacation(e, vacation.id)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </td>
                    </tr>
                  </For>
                </tbody>
              </table>
            </If>
          </div>
          <div className='modal-footer'>
            <If condition={true}>
              <button
                type='button'
                className='btn btn-sm btn-outline-secondary mb-1 float-left'
                onClick={this.startVacationsArrange}
              >
                Опрацювати відпустки
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
