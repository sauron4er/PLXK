import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import orgStructureStore from './org_structure_store';
import 'static/css/my_styles.css';

class ChiefSeatNode extends React.Component {
  onClick = () => {
    orgStructureStore.modal_opened = true;
    orgStructureStore.clicked_seat_id = this.props.data.seat_id;
    orgStructureStore.clicked_seat = this.props.data.name;
  };

  render() {
    return (
      <div className='css_org_structure_chief' onClick={this.onClick}>
        {this.props.data.name}
      </div>
    );
  }
}

export default view(ChiefSeatNode);
