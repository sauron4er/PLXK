import * as React from 'react'
import ReactDOM from 'react-dom'
import CorrTemplates from "correspondence/templates/corr_templates/corr_templates";

class CorrTemplatesIndex extends React.Component {
  render() {
    return (
      <CorrTemplates/>
    );
  }
}

ReactDOM.render(<CorrTemplatesIndex />, document.getElementById('corr_templates'));
