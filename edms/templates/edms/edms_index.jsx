import React from 'react'
import ReactDOM from 'react-dom'
import MyDocs from 'edms/templates/edms/my_docs/my_docs'
import HR from 'edms/templates/edms/hr/hr'
import Archive from 'edms/templates/edms/archive/archive'
import SubDocs from 'edms/templates/edms/sub_docs/sub_docs';
import Tables from 'edms/templates/edms/tables/tables';


class EDMS extends React.Component {
  state = {
    main_div: document.getElementById("bundle").parentNode.id,
  }
  
  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'my_docs'}>
          <MyDocs/>
        </When>
        <When condition={this.state.main_div === 'hr'}>
          <HR/>
        </When>
        <When condition={this.state.main_div === 'sub_docs'}>
          <SubDocs/>
        </When>
        <When condition={this.state.main_div === 'archive'}>
          <Archive/>
        </When>
        <When condition={this.state.main_div === 'tables'}>
          <Tables/>
        </When>
      </Choose>
    );
  }
}

ReactDOM.render(<EDMS />, document.getElementById('bundle'));
