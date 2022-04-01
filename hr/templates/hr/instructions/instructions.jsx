'use strict';
import * as React from 'react';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import Modal from 'react-responsive-modal';
import PaginatedTable from 'templates/components/tables/paginated_table';
import Instruction from 'hr/templates/hr/instructions/instruction';
import Regulation from 'hr/templates/hr/instructions/regulation';

class Instructions extends React.Component {
  state = {
    modal_open: false,
    modal_type: '',
    clicked_doc_id: 0
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
    const {modal_open, modal_type, clicked_doc_id} = this.state;

    return (
      <div className='pt-1'>
        <div className='d-flex flex-lg-row'>
          <div className='col-6'>
            <div className='text-center'>Положення про відділ</div>
            <If condition={window.is_admin}>
              <button className='btn btn-outline-primary mr-1' onClick={(e) => this.openModal("new_regulation")}>
                Додати положення про відділ
              </button>
            </If>
            <PaginatedTable
              url={'get_regulations'}
              columns={regulations_columns}
              defaultSorting={[{columnName: 'id', direction: 'desc'}]}
              colWidth={regulations_col_width}
              onRowClick={(row) => this.onRowClick(row, 'view_regulation')}
              // height={main_div_height}
              filter
            />
          </div>
          <div className='col-6'>
            <div className='text-center'>Інструкції</div>
            <If condition={window.is_admin}>
              {/* TODO переробити на is_hr */}
              <button className='btn btn-outline-primary' onClick={(e) => this.openModal("new_instruction")}>
                Додати посадову або робочу інструкцію
              </button>
            </If>
            <PaginatedTable
              url={'get_instructions'}
              columns={instructions_columns}
              defaultSorting={[{columnName: 'id', direction: 'desc'}]}
              colWidth={instructions_col_width}
              onRowClick={(row) => this.onRowClick(row, 'view_instruction')}
              // height={main_div_height}
              filter
            />
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
      </div>
    );
  }
}

export default Instructions;

const regulations_columns = [
  {name: 'id', title: 'id'},
  {name: 'department', title: 'Відділ'},
  {name: 'file', title: 'Файл'}
];

const regulations_col_width = [{columnName: 'id', width: 30}];

const instructions_columns = [
  {name: 'id', title: 'id'},
  {name: 'department', title: 'Відділ'},
  {name: 'seat', title: 'Посада'},
  {name: 'file', title: 'Файл'}
];

const instructions_col_width = [{columnName: 'id', width: 30}];
