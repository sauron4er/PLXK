import * as React from 'react'
import ReactDOM from 'react-dom'
import 'react-responsive-modal/styles.css';
import Instructions from "./instructions/instructions";

class Hr extends React.Component {
  state = {
    main_div: document.getElementById("bundle").parentNode.id,
  }
  
  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'instructions'}>
          <Instructions/>
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<Hr />, document.getElementById('bundle'));
