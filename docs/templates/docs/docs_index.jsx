import * as React from 'react'
import ReactDOM from 'react-dom'
import Orders from './orders/index'
import Contracts from './contracts/index'
import 'react-responsive-modal/styles.css'

class Docs extends React.Component {
  state = {
    main_div: document.getElementById("bundle").parentNode.id,
  }
  
  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'orders'}>
          <Orders/>
        </When>
        <When condition={this.state.main_div === 'contracts'}>
          <Contracts/>
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<Docs />, document.getElementById('bundle'));
