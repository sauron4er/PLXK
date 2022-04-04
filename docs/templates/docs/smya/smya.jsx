import * as React from 'react';
import DxTable from 'templates/components/tables/dx_table';
import { axiosGetFileRequest } from "templates/components/axios_requests";


class Smya extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    main_div_height: 0,
    doc_id: 0,
    excel_loading: false
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 50});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (item) => {
    this.setState({doc_id: item.id});
  };
  
  getExcelClicked = () => {
    this.setState({excel_loading: true}, () => {
      this.getExcel();
    });
  };
  
  getExcel = () => {
    axiosGetFileRequest(`get_docs_excel/`, 'docs.xlsx')
      .then((response) => {
        this.setState({excel_loading: false});
      })
      .catch((error) => notify(error));
  };

  render() {
    const {main_div_height, doc_id, excel_loading} = this.state;
    return (
      <>
        <div className='d-flex flex-row-reverse'>
          <button className='btn btn-sm btn-outline-info' onClick={this.getExcelClicked} disabled={excel_loading}>
            Завантажити в Excel
          </button>
        </div>
        <div className='mt-3' ref={this.getMainDivRef} style={{ height: "85vh" }}>
      
          <DxTable
            rows={window.docs_list}
            columns={columns}
            colWidth={col_width}
            onRowClick={this.onRowClick}
            height={main_div_height}
            filter
          />
        </div>
      </>
    );
  }
}

const columns = [
  {name: 'group_name', title: 'Група'},
  {name: 'type_name', title: 'Тип'},
  {name: 'code', title: 'Код'},
  {name: 'name', title: 'Назва'},
  {name: 'files', title: 'Файл'},
  {name: 'act', title: 'Актуальність'},
  {name: 'author', title: 'Автор'},
  {name: 'responsible', title: 'Відповідальний'},
  {name: 'date_start', title: 'Діє з'}
];

const col_width = [
  {columnName: 'id', width: 40},
  {columnName: 'date_start', width: 80},
  {columnName: 'files', width: 230},
  {columnName: 'act', width: 100},
  {columnName: 'group_name', width: 150},
  {columnName: 'type_name', width: 150},
  {columnName: 'code', width: 200},
  {columnName: 'author', width: 300},
  {columnName: 'responsible', width: 300}
];

export default Smya;
