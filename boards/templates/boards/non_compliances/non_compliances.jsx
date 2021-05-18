'use strict';
import * as React from 'react';
import ClientsTable from 'boards/templates/boards/counterparty/clients/table';
import Counterparty from 'boards/templates/boards/counterparty/components/counterparty';
import NonComplianceTable from 'boards/templates/boards/non_compliances/table';
import NonCompliance from 'boards/templates/boards/non_compliances/non_compliance/non_compliance';

class NonCompliances extends React.Component {
  state = {
    non_compliance_id: 0,
    view: 'table' // non_compliance
  };

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  onRowClick = (clicked_row) => {
    this.setState({
      non_compliance_id: clicked_row.id,
      view: 'non_compliance'
    });
  };

  changeView = (name) => {
    this.setState({view: name});
  };

  getButtonStyle = (name) => {
    if (name === this.state.view) return 'btn btn-sm btn-secondary mr-1 active';
    return 'btn btn-sm btn-secondary mr-1';
  };

  render() {
    const {view, non_compliance_id} = this.state;
    const {counterparty_id} = this.props;

    return (
      <Choose>
        <When condition={view === 'table'}>
          <div className='row mt-2' ref={this.getMainDivRef} style={{height: '90vh'}}>
            <div className='mr-auto'>
              <button onClick={() => this.changeView('non_compliance')} className='btn btn-sm btn-info mr-2'>
                Додати акт невідповідності
              </button>
            </div>

            {/*<NonComplianceTable onRowClick={this.onRowClick} />*/}
          </div>
        </When>
        <Otherwise>
          <button className='btn btn-sm btn-info my-2' onClick={() => location.reload()}>
            Назад
          </button>
          <br />
          <NonCompliance id={counterparty_id} />
        </Otherwise>
      </Choose>
    );
  }
  
  static defaultProps = {
    counterparty_id: 0
  }
}

export default NonCompliances;
