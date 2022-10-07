import * as React from 'react'
import ReactDOM from 'react-dom'
import Vacations from "boards/templates/boards/vacations/vacations";

class VacationsIndex extends React.Component {
  render() {
    return (
      <Vacations/>
    );
  }
}

ReactDOM.render(<VacationsIndex />, document.getElementById('vacations'));
