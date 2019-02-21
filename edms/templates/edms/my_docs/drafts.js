'use strict';
import React from 'react';
import DxTable from '../_else/dx_table';
import DocInfo from '../doc_info/doc_info'
import '../_else/my_styles.css'
import axios from "axios";

class Drafts extends React.Component {
  
  state = {
    my_drafts_columns: [
      { name: 'id', title: '№' },
      { name: 'type', title: 'Тип' },
      { name: 'date', title: 'Дата' },
    ],
    my_drafts_col_width: [
      { columnName: 'id', width: 70 },
      { columnName: 'type' },
      { columnName: 'date', width: 100 },
    ],
    row: '',
    draft_list: [],
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
  };
  
  onChange = (event) => {
    this.setState({[event.target.name]:event.target.value});
  };

  // отримуємо з бд список посад для селекту "На погодження"
  componentDidMount() {
    this.setState({ main_div_height: this.mainDivRef.clientHeight - 30 }); // для правильного розрахунку висоти таблиці
    if (this.state.draft_list.length === 0) {
      axios({
        method: 'get',
        url: 'get_drafts/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }).then((response) => {
        this.setState({
          draft_list: response.data,
        })
      }).catch((error) => {
        console.log('errorpost: ' + error);
      });
    }
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    this.setState({row:clicked_row});
  };

  render() {
    const {my_drafts_columns, my_drafts_col_width, main_div_height} = this.state;

    return(
      <div className="row css_main_div " ref={this.getMainDivRef}>
        <If condition={this.state.draft_list.length > 0}>
          <div className="col-lg-4">Чернетки
            <DxTable
              rows={this.state.draft_list}
              columns={my_drafts_columns}
              defaultSorting={[{ columnName: "date", direction: "asc" }]}
              colWidth={my_drafts_col_width}
              onRowClick={this.onRowClick}
              height={main_div_height}
              filter
            />
          </div>
        </If>
      </div>
    )
  }
}

export default Drafts;