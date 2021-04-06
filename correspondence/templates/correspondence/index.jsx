import * as React from 'react'
import ReactDOM from 'react-dom'
import Correspondence from './correspondence';

class CorrespondenceIndex extends React.Component {
  render() {
    return (
      <Correspondence/>
    );
  }
}

ReactDOM.render(<CorrespondenceIndex />, document.getElementById('correspondence'));
