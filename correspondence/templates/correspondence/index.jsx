'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import CorrTable from './corr_table';
import Clients from './clients';
import Laws from './laws';

class Correspondence extends React.Component {
  state = {
    view: 'laws', // table, clients, laws
    clients: window.clients,
    laws: window.laws,
  };

  componentDidMount() {}

  onRowClick = (clicked_row) => {
    this.setState({
      row: clicked_row,
      table_view: false
    });
  };

  changeView = (e, name) => {
    e.preventDefault();
    this.setState({
      view: name
    });
  };

  getButtonStyle = (name) => {
    if (name === this.state.view) {
      return 'btn btn-sm btn-secondary active';
    }
    return 'btn btn-sm btn-secondary';
  };

  changeListFromChildren = (name, new_list) => {
    this.setState({
      [name]: new_list
    });
  };

  render() {
    const {view, clients, laws, corr} = this.state;
    return (
      <>
        <div className='btn-group mb-2' role='group' aria-label='Basic example'>
          <button
            type='button'
            className={this.getButtonStyle('table')}
            onClick={(e) => this.changeView(e, 'table')}
          >
            Запити
          </button>
          <button
            type='button'
            className={this.getButtonStyle('clients')}
            onClick={(e) => this.changeView(e, 'clients')}
          >
            Клієнти
          </button>
          <button
            type='button'
            className={this.getButtonStyle('laws')}
            onClick={(e) => this.changeView(e, 'laws')}
          >
            Законодавство
          </button>
        </div>

        <Choose>
          <When condition={view === 'table'}>
            <CorrTable />
          </When>
          <When condition={view === 'clients'}>
            <Clients clients={clients} changeList={this.changeListFromChildren} />
          </When>
          <When condition={view === 'laws'}>
            <Laws laws={laws} changeList={this.changeListFromChildren} />
          </When>
        </Choose>
      </>
    );
  }
}

ReactDOM.render(<Correspondence />, document.getElementById('correspondence'));
