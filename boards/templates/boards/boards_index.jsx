import * as React from 'react'
import ReactDOM from 'react-dom'
// import Fireworks from './plhk_ads/fireworks';
// import Reloader from './plhk_ads/reloader';
// import {Calendar} from 'templates/components/calendar';
import Phones from 'boards/templates/boards/phones';
import 'react-responsive-modal/styles.css';

class Boards extends React.Component {
  state = {
    main_div: document.getElementById("bundle").parentNode.id,
  }
  
  render() {
    return (
      <Choose>
        <When condition={this.state.main_div === 'phones'}>
          <Phones/>
        </When>
        {/*<When condition={this.state.main_div === 'calendar'}>*/}
        {/*  <Calendar/>*/}
        {/*</When>*/}
        {/*<When condition={this.state.main_div === 'fireworks'}>*/}
        {/*  <Fireworks/> /!* Феєрверки для plhk_ads *!/*/}
        {/*</When>*/}
        {/*<When condition={this.state.main_div === 'reloader'}>*/}
        {/*  <Reloader/> /!* Оновлення сторінки plhk_ads *!/*/}
        {/*</When>*/}
      </Choose>
    );
  }
}

ReactDOM.render(<Boards />, document.getElementById('bundle'));
