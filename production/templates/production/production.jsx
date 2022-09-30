import * as React from 'react';
import ReactDOM from 'react-dom';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import ContractSubjects from './contract_subjects/contract_subjects';

class Nomenclatures extends React.Component {
  state = {
    main_div: document.getElementById('bundle').parentNode.id
  };

  render() {
    return (
      <>
        <Choose>
          <When condition={this.state.main_div === 'contract_subjects'}>
            <ContractSubjects />
          </When>
        </Choose>
        
        <ToastContainer />
      </>
    );
  }
}

ReactDOM.render(<Nomenclatures />, document.getElementById('bundle'));
