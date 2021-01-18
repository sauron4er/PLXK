'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {Loader} from 'templates/components/loaders';
import {notify} from 'templates/components/my_extras';
import 'static/css/my_styles.css';
import Modal from 'react-responsive-modal';
import Document from 'edms/templates/edms/my_docs/doc_info/document';

class Tables extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    doc_types: window.doc_types,
    doc_type_id: 0,
    doc_type_name: '',
    loading: false,
    header: [],
    rows: [],
    clicked_row_id: 0
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight});
  }

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    this.setState(
      {
        doc_type_id: event.target.options[selectedIndex].getAttribute('data-key'),
        doc_type_name: event.target.options[selectedIndex].getAttribute('value'),
        loading: event.target.options[selectedIndex].getAttribute('data-key') !== '0'
      },
      () => {this.getTable();}
    );
  };

  getTable = () => {
    if (this.state.doc_type_id !== '0') {
      axiosGetRequest('get_table/' + this.state.doc_type_id + '/')
        .then((response) => {
          this.setState({
            column_widths: response.column_widths,
            header: response.header,
            rows: response.rows,
            loading: false
          });
        })
        .catch((error) => notify(error));
    } else {
      this.setState({
        header: [],
        rows: []
      });
    }
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {
    this.setState({clicked_row_id: row.id});
  };

  render() {
    const {
      main_div_height,
      doc_types,
      doc_type_name,
      column_widths,
      header,
      rows,
      clicked_row_id,
      loading
    } = this.state;
  
    return (
      <>
        <Choose>
          <When condition={!loading}>
            <div className='css_main_div'>
              <select
                className='form-control mx-3 mx-lg-0'
                id='doc_type'
                name='doc_type'
                value={doc_type_name}
                onChange={this.onChange}
              >
                <option key={0} data-key={0} value='0'>
                  Оберіть тип документу
                </option>
                {doc_types.map((doc_type) => {
                  return (
                    <option key={doc_type.id} data-key={doc_type.id} value={doc_type.name}>
                      {doc_type.name}
                    </option>
                  );
                })}
              </select>
              <div ref={this.getMainDivRef}>
                <If condition={header.length}>
                  <DxTable
                    rows={rows}
                    // rows={test_rows}
                    columns={header}
                    colWidth={column_widths}
                    onRowClick={this.onRowClick}
                    height={main_div_height}
                    filter
                    coloredStatus
                    coloredStage
                  />
                </If>
              </div>
            </div>
          </When>
          <Otherwise>
            <Loader />
          </Otherwise>
        </Choose>
        <Modal
          open={clicked_row_id !== 0}
          onClose={() => this.setState({clicked_row_id: 0})}
          showCloseIcon={true}
          closeOnOverlayClick={true}
          styles={{modal: {marginTop: 50}}}
        >
          <Document
            doc_id={clicked_row_id}
            closed={true}
          />
        </Modal>
      </>
    );
  }

  static defaultProps = {
    showRequest: () => {}
  };
}

export default Tables
