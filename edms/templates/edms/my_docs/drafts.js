'use strict';
import React from 'react';
import DxTable from '../_else/dx_table';
import '../_else/my_styles.css'
import axios from "axios";
import FreeTime from "./doc_forms/free_time";
import CarryOut from "./doc_forms/carry_out";
import WorkNote from "./doc_forms/work_note";
import Decree from "./doc_forms/decree/decree";
import {getIndex} from "../_else/my_extras";

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
    selected_draft: {type: 0},
    draft_list: [],
    main_div_height: 0, // розмір головного div, з якого вираховується розмір таблиць
  };
  
  onChange = (event) => {
    this.setState({[event.target.name]:event.target.value});
  };

  // отримуємо з бд список чернеток
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
    this.setState({selected_draft:clicked_row});
  };
  
  // обнуляє селект при закритті модального вікна
  onCloseModal = () => {
    this.setState({
      selected_draft: {type: 0},
    });
  };
  
  // додаємо документ у список
  addDraft = (id, type, date, type_id) => {
    const new_doc = {
      date: date,
      id: id,
      type: type,
      type_id: type_id
    };

    this.setState(prevState => ({
      draft_list: [...prevState.draft_list, new_doc]
    }));
  };

  // видаляємо документ із списку чернеток
  delDraft = (draft_id) => {
    let new_drafts = this.state.draft_list.filter(draft => draft.id !== draft_id);
    this.setState({
      draft_list: new_drafts,
    })
  };
  
  render() {
    const {my_drafts_columns, my_drafts_col_width, main_div_height, selected_draft} = this.state;

    return(
      <div className="row css_main_div " ref={this.getMainDivRef}>
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
        <Choose>
          <When condition={selected_draft.type_id === 1}>
            <FreeTime
              docId={selected_draft.id}
              addDoc={this.props.addDoc}
              addDraft={this.addDraft}
              delDraft={this.delDraft}
              onCloseModal={this.onCloseModal}
            />
          </When>
          <When condition={selected_draft.type_id === 2}>
            <CarryOut
              docId={selected_draft.id}
              addDoc={this.props.addDoc}
              addDraft={this.addDraft}
              delDraft={this.delDraft}
              onCloseModal={this.onCloseModal}
            />
          </When>
          <When condition={selected_draft.type_id === 3}>
            <WorkNote
              docId={selected_draft.id}
              addDoc={this.props.addDoc}
              addDraft={this.addDraft}
              delDraft={this.delDraft}
              onCloseModal={this.onCloseModal}
            />
          </When>
          <When condition={selected_draft.type_id === 4}>
            <Decree
              docId={selected_draft.id}
              addDoc={this.props.addDoc}
              addDraft={this.addDraft}
              delDraft={this.delDraft}
              onCloseModal={this.onCloseModal}
            />
          </When>
          <Otherwise>

          </Otherwise>
        </Choose>
      </div>
    )
  }
}

export default Drafts;