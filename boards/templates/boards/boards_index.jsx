import * as React from 'react'
import ReactDOM from 'react-dom'
import Fireworks from './plhk_ads/fireworks';
import Reloader from './plhk_ads/reloader';
import OrgStructure from './org_structure/org_structure';
import ProvidersIndex from './counterparty/providers';
import ClientsIndex from './counterparty/clients';
import {Calendar} from 'templates/components/calendar';

class Boards extends React.Component {
  state = {
    main_div: document.getElementById("bundle").parentNode.id,
  }
  
  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'fireworks'}>
          <Fireworks/> {/* Феєрверки для plhk_ads */}
        </When>
        <When condition={this.state.main_div === 'reloader'}>
          <Reloader/> {/* Оновлення сторінки plhk_ads */}
        </When>
        <When condition={this.state.main_div === 'org_structure'}>
          <OrgStructure/>
        </When>
        <When condition={this.state.main_div === 'providers'}>
          <ProvidersIndex/>
        </When>
        <When condition={this.state.main_div === 'clients'}>
          <ClientsIndex/>
        </When>
        <When condition={this.state.main_div === 'calendar'}>
          <Calendar/>
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<Boards />, document.getElementById('bundle'));
