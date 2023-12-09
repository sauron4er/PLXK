'use strict';
import * as React from 'react';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Modal from 'react-responsive-modal';
import ExternalPhoneEdit from 'boards/templates/boards/phones/external_phone_edit';

class PhonesOut extends React.Component {
  state = {
    external_phone: {
      id: 0,
      owner: '',
      number: ''
    },
    filter: '',
    external_phones: [],
    modal_opened: false
  };

  componentDidMount() {
    this.setState({external_phones: [...window.external_phones]});
  }

  filterChange = (e) => {
    const filter = e.target.value.toLowerCase();
    let external_phones = [...window.external_phones];
    external_phones = external_phones.filter((item) => {
      return item.owner.toLowerCase().indexOf(filter) !== -1 || item.number.indexOf(filter) !== -1;
    });
    this.setState({
      filter: e.target.value,
      external_phones: [...external_phones]
    });
  };

  onClick = (item) => {
    this.setState({
      external_phone: item,
      modal_opened: true
    });
  };

  addPhoneModalOpen = (item) => {
    this.setState({modal_opened: true});
  };



  render() {
    const {external_phone, filter, external_phones, modal_opened} = this.state;
    return (
      <>
        <div>
          <label>Пошук</label>
          <input className='ml-2' value={filter} onChange={this.filterChange} />
          <button className='btn btn-sm btn-outline-primary float-right' onClick={this.addPhoneModalOpen}>Додати</button>
        </div>
        <table className='table table-sm table-striped table-hover table-bordered'>
          <thead className='thead-light'>
            <tr>
              <th>Власник</th>
              <th style={{width: '150px'}}>№ тел.</th>
              <If condition={is_staff}>
                <th style={{width: '35px'}}> </th>
              </If>
            </tr>
          </thead>
          <tbody>
            <For each='item' of={external_phones} index='index'>
              <tr key={index}>
                <td className='align-middle'>{item.owner}</td>
                <td className='text-center align-middle' style={{width: '150px'}}>
                  {item.number}
                </td>
                <If condition={is_staff}>
                  <th style={{width: '35px'}}>
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
          styles={{modal: {marginTop: 75}}}
        >
          <ExternalPhoneEdit phone={external_phone} />
        </Modal>
      </>
    );
  }
}

export default PhonesOut;
