'use strict';
import * as React from 'react';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Modal from 'react-responsive-modal';
import EmployeePAM from 'boards/templates/boards/phones/employee_pam';

class Phones extends React.Component {
  state = {
    employee: {
      id: 0,
      pip: '',
      phone: '',
      mail: ''
    },
    filter: '',
    pam: [],
    modal_opened: false
  };

  componentDidMount() {
    this.setState({pam: [...window.pam]});
  }

  filterChange = (e) => {
    const filter = e.target.value.toLowerCase();
    let pam = [...window.pam];
    pam = pam.filter((item) => {
      return item.pip.toLowerCase().indexOf(filter) !== -1 || item.phone.indexOf(filter) !== -1 || item.mail.indexOf(filter) !== -1;
    });
    this.setState({
      filter: e.target.value,
      pam: [...pam]
    });
  };

  getMailto = (mail) => {
    return `mailto:${mail}`;
  };

  onClick = (item) => {
    this.setState({
      employee: item,
      modal_opened: true
    });
  };

  render() {
    const {employee, filter, pam, modal_opened} = this.state;
    return (
      <div className='mt-3' style={{margin: 'auto', height: '90%', position: 'absolute'}}>
        <h4>Телефонний та поштовий довідник</h4>
        <label>Пошук</label>
        <input className='ml-2' value={filter} onChange={this.filterChange} />
        <table className='table table-sm table-striped table-hover table-bordered'>
          <thead className='thead-light'>
            <tr>
              <th>П.І.Б.</th>
              <th>№ тел.</th>
              <th>e-mail</th>
              <If condition={is_staff}>
                <th> </th>
              </If>
            </tr>
          </thead>
          <tbody>
            <For each='item' of={pam} index='index'>
              <tr key={index}>
                <td className='align-middle'>{item.pip}</td>
                <td className='text-center align-middle'>{item.phone}</td>
                <td className='align-middle'>
                  <a href={this.getMailto(item.mail)}>{item.mail}</a>
                </td>
                <If condition={is_staff}>
                  <th>
                    <button className='btn btn-sm' onClick={() => this.onClick(item)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </th>
                </If>
              </tr>
            </For>
          </tbody>
        </table>
        <Modal
          open={modal_opened}
          onClose={() => this.setState({modal_opened: false})}
          closeOnOverlayClick={false}
          styles={{modal: {marginTop: 50}}}
        >
          <EmployeePAM employee={employee} />
        </Modal>
      </div>
    );
  }
}

export default Phones;
