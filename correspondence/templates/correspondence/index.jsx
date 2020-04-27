'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import CorrTable from './corr_table';
import Clients from './clients';
import Laws from './laws';

// Спливаюче повідомлення
const notify = (message) =>
  toast.error(message, {
    position: 'bottom-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

class Correspondence extends React.Component {
  state = {
    view: 'clients', // table, clients, laws
    clients: window.clients
  };

  componentDidMount() {}

  onRowClick = (clicked_row) => {
    this.setState({
      row: clicked_row,
      table_view: false
    });
  };

  onGoBack = (e) => {
    e.preventDefault();
    this.setState({
      table_view: true,
      row: {}
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

  //TODO Переробити так, щоб компоненти самі змінювали свої списки і повертали сюди вже змінені списки,
  // все це опрацьовувати однією функцією ChangeList(new_list, name)

  newClient = (client) => {
    const {clients} = this.state;
    clients.push(client);
    this.setState({
      clients
    })
  };

  delClient = (id) => {
    const {clients} = this.state;
    const new_clients = clients.filter(client => client.id !== id);
    console.log(new_clients);
    this.setState({clients: new_clients});
  };

  render() {
    const {view, clients, laws, corr} = this.state;
    return (
      <>
        <div className='row mb-2'>
          <div className='btn-group' role='group' aria-label='Basic example'>
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
        </div>
        <div className='row'>
          <Choose>
            <When condition={view === 'table'}>
              <CorrTable />
            </When>
            <When condition={view === 'clients'}>
              <Clients clients={clients} newClient={this.newClient} delClient={this.delClient} />
            </When>
            <When condition={view === 'laws'}>
              <Laws />
            </When>
          </Choose>
        </div>
        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </>
    );
  }
}

ReactDOM.render(<Correspondence />, document.getElementById('correspondence'));
