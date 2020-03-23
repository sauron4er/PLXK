'use strict';
import React from 'react';
import DxTable from '../../../../templates/components/dx_table';
import 'static/css/my_styles.css';
import axios from 'axios';
import NewDocument from './new_doc_modules/new_document';

class Templates extends React.Component {
  state = {
    my_templates_columns: [
      {name: 'id', title: '№'},
      {name: 'type', title: 'Тип'},
      {name: 'date', title: 'Дата'}
    ],
    my_templates_col_width: [
      {columnName: 'id', width: 70},
      {columnName: 'type'},
      {columnName: 'date', width: 100}
    ],
    selected_template: {type_id: 0},
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  onChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };
  
  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 30});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    this.setState({selected_template: clicked_row});
  };

  // обнуляє селект при закритті модального вікна
  onCloseModal = () => {
    this.setState({
      selected_template: {type_id: 0}
    });
  };

  render() {
    const {
      my_templates_columns,
      my_templates_col_width,
      main_div_height,
      selected_template
    } = this.state;
    
    const templates = this.props.templates ? this.props.templates.filter(doc => doc.status === 'template') : [];

    return (
      <div className='row css_main_div' ref={this.getMainDivRef}>
        <div className='col-lg-4'>
          Шаблони
          <DxTable
            rows={templates}
            columns={my_templates_columns}
            defaultSorting={[{columnName: 'date', direction: 'asc'}]}
            colWidth={my_templates_col_width}
            onRowClick={this.onRowClick}
            height={main_div_height}
            filter
          />
        </div>
        <Choose>
          <When condition={selected_template.type_id !== 0}>
            <NewDocument
              doc={selected_template}
              addDoc={this.props.addDoc}
              removeDoc={this.props.removeDoc}
              onCloseModal={this.onCloseModal}
              status={'template'}
            />
          </When>
          <Otherwise> </Otherwise>
        </Choose>
      </div>
    );
  }
  
  static defaultProps = {
    templates: []
  }
  
}

export default Templates;
