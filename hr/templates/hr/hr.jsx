import * as React from 'react'
import ReactDOM from 'react-dom'
import 'react-responsive-modal/styles.css';
import Instructions from "./instructions/instructions";
// import OrgStructure from "hr/templates/hr/org_structure_old/org_structure";
import OrgStructure from "hr/templates/hr/org_structure/org_structure";

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
        <When condition={this.state.main_div === 'org_structure'}>
          <OrgStructure/>
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<Hr />, document.getElementById('bundle'));
