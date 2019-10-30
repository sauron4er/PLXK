'use strict';
import React from 'react';
import DxTable from '../components/dx_table';
import '../_else/my_styles.css';
import axios from 'axios';
import NewDocument from './new_doc_modules/new_document';

class Drafts extends React.Component {
  state = {
    my_drafts_columns: [
      {name: 'id', title: '№'},
      {name: 'type', title: 'Тип'},
      {name: 'date', title: 'Дата'}
    ],
    my_drafts_col_width: [
      {columnName: 'id', width: 70},
      {columnName: 'type'},
      {columnName: 'date', width: 100}
    ],
    selected_draft: {type_id: 0},
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };
  
  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 30});
  }

  onRowClick = (clicked_row) => {
    this.setState({selected_draft: clicked_row});
  };

  // обнуляє селект при закритті модального вікна
  onCloseModal = () => {
    this.setState({
      selected_draft: {type_id: 0}
    });
  };
  
  // видаляємо документ із списку чернеток
  // delDraft = (draft_id) => {
  //   let new_drafts = this.state.draft_list.filter((draft) => draft.id !== draft_id);
  //   this.setState({
  //     draft_list: new_drafts
  //   });
  // };

  render() {
    const {
      my_drafts_columns,
      my_drafts_col_width,
      main_div_height,
      selected_draft
    } = this.state;
    
    const drafts = this.props.drafts ? this.props.drafts.filter(doc => doc.status === 'draft') : [];

    return (
      <div className='row css_main_div' ref={this.getMainDivRef}>
        <div className='col-lg-4'>
          Чернетки
          <DxTable
            rows={drafts}
            columns={my_drafts_columns}
            defaultSorting={[{columnName: 'date', direction: 'asc'}]}
            colWidth={my_drafts_col_width}
            onRowClick={this.onRowClick}
            height={main_div_height}
            filter
          />
        </div>
        <Choose>
          <When condition={selected_draft.type_id !== 0}>
            <NewDocument
              doc={selected_draft}
              addDoc={this.props.addDoc}
              removeDoc={this.props.removeDoc}
              onCloseModal={this.onCloseModal}
              status={'draft'}
            />
          </When>
          <Otherwise> </Otherwise>
        </Choose>
      </div>
    );
  }
  
  static defaultProps = {
    drafts: []
  }
}

export default Drafts;
