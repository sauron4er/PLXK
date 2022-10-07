import * as React from 'react';
import ReactDOM from "react-dom";
import PaginatedTable from 'templates/components/tables/paginated_table';
import Modal from 'react-responsive-modal';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import SubmitButton from 'templates/components/form_modules/submit_button';
import 'react-responsive-modal/styles.css';

const columns = [
  {name: 'id', title: 'id'},
  {name: 'employee__pip', title: 'Співробітник'},
  {name: 'employee__tab_number', title: 'Таб. номер'},
  {name: 'edms_doc__doc_type_version__description', title: 'Тип документу'},
  {name: 'out_datetime', title: 'Вихід'},
  {name: 'in_datetime', title: 'Вхід'},
  {name: 'edms_doc__id', title: 'Док.№'}
];

const col_width = [
  {columnName: 'id', width: 40},
  {columnName: 'edms_doc__id', width: 70},
  {columnName: 'employee__tab_number', width: 100},
  {columnName: 'out_datetime', width: 130},
  {columnName: 'in_datetime', width: 130}
];

class Foyer extends React.Component {
  state = {
    opened_doc_id: 0,
    modal_opened: false,
    report_link: '',
    main_div_height: 0
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 50});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (item) => {
    this.setState({
      opened_doc_id: item.edms_doc__id,
      modal_opened: true
    });
  };

  closeModal = () => {
    this.setState({modal_opened: false});
  };

  createReport = () => {
    axiosGetRequest(`create_report`)
      .then((response) => {
        this.setState({report_link: response});
      })
      .catch((error) => notify(error));
  };

  render() {
    const {modal_opened, opened_doc_id, report_link, main_div_height} = this.state;
    return (
      <div className='mt-3' ref={this.getMainDivRef} style={{height: '90vh'}}>
        <div className='d-flex justify-content-between'>
          <h4>Прохідна</h4>
          <Choose>
            <When condition={report_link}>
              <a href={`../${report_link}`} download>
                <button className='btn btn-sm btn-secondary my-2'>Завантажити файл звіту</button>
              </a>
            </When>
            <Otherwise>
              <SubmitButton className='btn-sm btn-outline-secondary' text={'Створити звіт'} onClick={this.createReport} />
            </Otherwise>
          </Choose>
        </div>
        <PaginatedTable
          url={`get_foyer_data`}
          columns={columns}
          defaultSorting={[{columnName: 'id', direction: 'desc'}]}
          colWidth={col_width}
          onRowClick={this.onRowClick}
          height={main_div_height}
          filter
        />
        <Modal open={modal_opened} onClose={this.closeModal} closeOnOverlayClick={true} styles={{modal: {marginTop: 100}}}>
          <Document doc_id={opened_doc_id} archived={true} closed={true} opened_in_modal={true} />
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<Foyer />, document.getElementById('bundle'));

// export default Foyer;
