import * as React from 'react'
import ReactDOM from 'react-dom'
import ProvidersIndex from './providers';
import ClientsIndex from './clients';
import 'react-responsive-modal/styles.css';

class Counterparties extends React.Component {
  state = {
    main_div: document.getElementById("bundle").parentNode.id,
  }
  
  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'providers'}>
          <ProvidersIndex/>
        </When>
        <When condition={this.state.main_div === 'clients'}>
          <ClientsIndex/>
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<Counterparties />, document.getElementById('bundle'));
