import * as React from 'react';
import ReactDOM from 'react-dom';
import Orders from './orders/index';
import Contracts from './contracts/index';
import 'react-responsive-modal/styles.css';
import Smya from 'docs/templates/docs/smya/smya';

class Docs extends React.Component {
  state = {
    main_div: document.getElementById('docs').parentNode.id
  };

  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'orders'}>
          <Orders />
        </When>
        <When condition={this.state.main_div === 'contracts'}>
          <Contracts />
        </When>
        <When condition={this.state.main_div === 'smya'}>
          <Smya />
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<Docs />, document.getElementById('docs'));
