'use strict';
import * as React from 'react';
import 'static/css/my_styles.css';
import Modal from 'react-responsive-modal';
import Document from 'edms/templates/edms/my_docs/doc_info/document';
import PaginatedTable from 'templates/components/tables/paginated_table';

class FreeTimeTable extends React.Component {
  state = {
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
    clicked_row_id: 0
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (row) => {
    this.setState({clicked_row_id: row.id});
  };

  render() {
    const {main_div_height, clicked_row_id} = this.state;

    return (
      <>
        <div className='css_main_div' ref={this.getMainDivRef}>
          <PaginatedTable
            url={'get_free_times'}
            columns={columns}
            defaultSorting={[{columnName: 'id', direction: 'desc'}]}
            colWidth={col_width}
            onRowClick={this.props.onRowClick}
            height={main_div_height}
            filter
          />
        </div>
        <Modal
          open={clicked_row_id !== 0}
          onClose={() => this.setState({clicked_row_id: 0})}
          showCloseIcon={true}
          closeOnOverlayClick={true}
          styles={{modal: {marginTop: 100}}}
        >
          <Document doc_id={clicked_row_id} closed={true} opened_in_modal />
        </Modal>
      </>
    );
  }

  static defaultProps = {};
}

export default FreeTimeTable;

const columns = [
  {name: 'id', title: 'id'},
  {name: 'author', title: 'Автор'},
  {name: 'datetime', title: 'Дата і час'},
  {name: 'purpose', title: 'Мета, П.І.Б. співробітника (якщо не автор'}
];

const col_width = [
  {columnName: 'id', width: 50},
  {columnName: 'author', width: 350},
  {columnName: 'datetime', width: 200}
];
