import * as React from 'react'
import ReactDOM from 'react-dom'
import 'react-responsive-modal/styles.css';
import Stationery from "ordering/templates/ordering/stationery/stationery";

class Ordering extends React.Component {
  state = {
    main_div: document.getElementById("bundle").parentNode.id,
  }
  
  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'stationery'}>
          <Stationery/>
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<Ordering />, document.getElementById('bundle'));
