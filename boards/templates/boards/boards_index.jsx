import React from 'react'
import ReactDOM from 'react-dom'
import Fireworks from './plhk_ads/fireworks';
import Reloader from './plhk_ads/reloader';
import OrgStructure from './org_structure/org_structure';

class Boards extends React.Component {
  state = {
    main_div: document.getElementById("bundle").parentNode.id,
  }
  
  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'fireworks'}>
          <Fireworks/> {/* Використовується на сторінці plhk_ads */}
        </When>
        <When condition={this.state.main_div === 'reloader'}>
          <Reloader/> {/* Використовується на сторінці plhk_ads */}
        </When>
        <When condition={this.state.main_div === 'org_structure'}>
          <OrgStructure/>
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<Boards />, document.getElementById('bundle'));
