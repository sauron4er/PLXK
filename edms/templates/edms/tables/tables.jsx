'use strict';
import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {Loader, LoaderSmall} from 'templates/components/loaders';
import {notify} from 'templates/components/my_extras';
import 'static/css/my_styles.css';
import Modal from 'react-responsive-modal';
import Document from 'edms/templates/edms/my_docs/doc_info/document';

class Tables extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    doc_types: window.doc_types ? window.doc_types : [],
    doc_type_id: 0,
    doc_type_name: '',
    loading: false,
    additional_loading: false,
    header: [],
    rows: [],
    clicked_row_id: 0
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight});

    if (this.props.doc_type_id !== 0) {
      this.setState(
        {
          doc_type_id: this.props.doc_type_id,
          loading: true
        },
        () => {
          this.getTable();
        }
      );
    }

    // Визначаємо, чи відкриваємо просто список документів, чи це посилання на конкретний документ:
    const arr = window.location.href.split('/');
    const last_href_piece = parseInt(arr[arr.length - 2]);
    const is_link = !isNaN(last_href_piece);

    if (is_link) {
      this.setState(
        {
          doc_type_id: last_href_piece,
          loading: true
        },
        () => {
          this.getTable();
        }
      );
    }
  }

  onChange = (event) => {
    const selectedIndex = event.target.options.selectedIndex;
    this.setState(
      {
        doc_type_id: event.target.options[selectedIndex].getAttribute('data-key'),
        doc_type_name: event.target.options[selectedIndex].getAttribute('value'),
        loading: event.target.options[selectedIndex].getAttribute('data-key') !== '0'
      },
      () => {
        this.getTable();
      }
    );
  };

  getTable = () => {
    if (this.state.doc_type_id !== '0') {
      axiosGetRequest('get_table_first/' + this.state.doc_type_id + '/' + this.props.counterparty_id + '/')
        .then((response) => {
          this.setState(
            {
              column_widths: response.column_widths,
              header: response.header,
              rows: response.rows,
              loading: false
            },
            () => {
              this.getAllRows();
            }
          );
        })
        .catch((error) => notify(error));
    } else {
      this.setState({
        header: [],
        rows: []
      });
    }
  };

  getAllRows = () => {
    if (this.state.rows.length === 23) {
      this.setState({additional_loading: true}, () => {
        axiosGetRequest('get_table_all/' + this.state.doc_type_id + '/' + this.props.counterparty_id + '/')
          .then((response) => {
            this.setState({
              rows: response,
              additional_loading: false
            });
          })
          .catch((error) => notify(error));
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
      loading,
      additional_loading
    } = this.state;

    return (
      <>
        <Choose>
          <When condition={!loading}>
            <div >
              <div className='d-flex'>
                <If condition={doc_types.length > 0}>
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
                
                <span style={{width: '40px', height: '40px', marginLeft: '10px'}}>
                  <If condition={additional_loading}>
                    <LoaderSmall />
                  </If>
                </span>
                  </If>
              </div>
              <div ref={this.getMainDivRef}>
                <If condition={header.length}>
                  <DxTable
                    rows={rows}
                    columns={header}
                    colWidth={column_widths}
                    onRowClick={this.onRowClick}
                    height={main_div_height}
                    filter
                    coloredStatus
                    coloredStage
                    coloredApproved
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
          <Document doc_id={clicked_row_id} closed={true} opened_in_modal />
        </Modal>
      </>
    );
  }

  static defaultProps = {
    showRequest: () => {},
    counterparty_id: 0,
    doc_type_id: 0
  };
}

export default Tables;
