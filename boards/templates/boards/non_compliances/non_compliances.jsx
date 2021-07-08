'use strict';
import * as React from 'react';
import NonComplianceTable from 'boards/templates/boards/non_compliances/table';
import NonCompliance from 'boards/templates/boards/non_compliances/non_compliance/non_compliance';
import nonComplianceStore from 'boards/templates/boards/non_compliances/non_compliance_store';

class NonCompliances extends React.Component {
  state = {
    view: 'table' // non_compliance
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  componentDidMount() {
    nonComplianceStore.counterparty_id = this.props.counterparty_id;
    nonComplianceStore.counterparty_name = this.props.counterparty_name;

    // Визначаємо, чи відкриваємо просто список, чи це конкретне посилання:
    const arr = window.location.pathname.split('/');
    let filtered = arr.filter((el) => el !== '');
    const last_href_piece = parseInt(filtered[filtered.length - 1]);
    const is_link = !isNaN(last_href_piece);
    if (is_link) this.showNonCompliance(last_href_piece);
  }

  showNonCompliance = (id) => {
    nonComplianceStore.non_compliance.id = id;
    this.setState({view: 'non_compliance'});
  };

  onRowClick = (clicked_row) => {
    nonComplianceStore.non_compliance.id = clicked_row.id;
    this.setState({view: 'non_compliance'});
  };

  changeView = (name) => {
    this.setState({view: name});
  };

  getButtonStyle = (name) => {
    if (name === this.state.view) return 'btn btn-sm btn-secondary mr-1 active';
    return 'btn btn-sm btn-secondary mr-1';
  };

  render() {
    const {view} = this.state;
    const {counterparty_id} = this.props;
  
    return (
      <Choose>
        <When condition={view === 'table'}>
          <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
            <div className='ml-3'>
              <button onClick={() => this.changeView('non_compliance')} className='btn btn-sm btn-info mr-2'>
                Додати акт невідповідності
              </button>
            </div>
            <NonComplianceTable onRowClick={this.onRowClick} />
          </div>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-info my-2' onClick={() => location.reload()}>
            Назад
          </button>
          <NonCompliance id={counterparty_id} />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    counterparty_id: 0,
    counterparty_name: ''
  };
}

export default NonCompliances;
