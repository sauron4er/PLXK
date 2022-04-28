'use strict';
import * as React from 'react';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import Modal from 'react-responsive-modal';
import Instruction from 'hr/templates/hr/instructions/instruction';
import Regulation from 'hr/templates/hr/instructions/regulation';
import DxTable from 'templates/components/tables/dx_table';
import {Loader} from 'templates/components/loaders';

class Instructions extends React.Component {
  state = {
    modal_open: false,
    modal_type: '',
    clicked_doc_id: 0,
    instructions: [],
    regulations: [],
    regulations_loading: true,
    instructions_loading: true
  };

  componentDidMount() {
    this.getRegulations();
    this.getInstructions();
  }

  getRegulations = () => {
    axiosGetRequest('get_regulations')
      .then((response) => {
        this.setState({
          regulations: response,
          regulations_loading: false
        });
      })
      .catch((error) => notify(error));
  };

  getInstructions = () => {
    axiosGetRequest('get_instructions')
      .then((response) => {
        this.setState({
          instructions: response,
          instructions_loading: false
        });
      })
      .catch((error) => notify(error));
  };

  onRowClick = (row, modal_type) => {
    this.setState({clicked_doc_id: row.id});
    this.openModal(modal_type);
  };

  openModal = (type) => {
    switch (type) {
      case 'new_regulation':
        this.setState({
          modal_open: true,
          modal_type: 'new_regulation'
        });
        break;
      case 'new_instruction':
        this.setState({
          modal_open: true,
          modal_type: 'new_instruction'
        });
        break;
      case 'view_regulation':
        this.setState({
          modal_open: true,
          modal_type: 'view_regulation'
        });
        break;
      case 'view_instruction':
        this.setState({
          modal_open: true,
          modal_type: 'view_instruction'
        });
        break;
    }
  };

  onCloseModal = () => {
    this.setState({
      modal_open: false,
      modal_type: ''
    });
  };

  render() {
    const {modal_open, modal_type, clicked_doc_id, regulations, regulations_loading, instructions, instructions_loading} = this.state;
  
    return (
      <>
        <div className='d-flex flex-lg-row pt-1'>
          <div className='col-6'>
            <Choose>
              <When condition={!regulations_loading}>
                <div className='d-flex'>
                  <h5 className='align-self-center'>Положення про відділ</h5>
                  <If condition={window.edit_enabled}>
                    <button className='btn btn-outline-primary ml-auto' onClick={(e) => this.openModal('new_regulation')}>
                      Додати положення про відділ
                    </button>
                  </If>
                </div>
                <DxTable
                  rows={regulations}
                  columns={regulations_columns}
                  defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                  colWidth={regulations_col_width}
                  onRowClick={(row) => this.onRowClick(row, 'view_regulation')}
                  // height={main_div_height}
                  filter
                />
              </When>
              <Otherwise>
                <Loader />
              </Otherwise>
            </Choose>
          </div>
          <div className='col-6'>
            <Choose>
              <When condition={!instructions_loading}>
                <div className='d-flex'>
                  <h5 className='align-self-center'>Посадові, робочі інструкції</h5>
                  <If condition={window.edit_enabled}>
                    <button className='btn btn-outline-primary ml-auto' onClick={(e) => this.openModal('new_instruction')}>
                      Додати посадову або робочу інструкцію
                    </button>
                  </If>
                </div>
                <DxTable
                  rows={instructions}
                  columns={instructions_columns}
                  defaultSorting={[{columnName: 'id', direction: 'desc'}]}
                  colWidth={instructions_col_width}
                  onRowClick={(row) => this.onRowClick(row, 'view_instruction')}
                  // height={main_div_height}
                  filter
                />
              </When>
            </Choose>
          </div>
        </div>
        <Modal
          open={modal_open}
          onClose={this.onCloseModal}
          showCloseIcon={true}
          closeOnOverlayClick={true}
          styles={{modal: {marginTop: 100}}}
        >
          <Choose>
            <When condition={modal_type === 'new_regulation'}>
              <Regulation id={0} />
            </When>
            <When condition={modal_type === 'view_regulation'}>
              <Regulation id={clicked_doc_id} />
            </When>
            <When condition={modal_type === 'new_instruction'}>
              <Instruction id={0} />
            </When>
            <When condition={modal_type === 'view_instruction'}>
              <Instruction id={clicked_doc_id} />
            </When>
          </Choose>
        </Modal>
      </>
    );
  }
}

export default Instructions;

const regulations_columns = [
  // {name: 'id', title: 'id'},
  {name: 'department', title: 'Відділ'},
  {name: 'files', title: 'Файл'}
];

const regulations_col_width = [{columnName: 'files', width: 250}];

const instructions_columns = [
  // {name: 'id', title: 'id'},
  {name: 'department', title: 'Відділ'},
  {name: 'seat', title: 'Посада'},
  {name: 'files', title: 'Файл'}
];

const instructions_col_width = [{columnName: 'files', width: 250}];
