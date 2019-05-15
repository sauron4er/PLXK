'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import Birthdays from './birthdays';

class Plhk_ads extends React.Component {

  getStyle = (component) => {
    // Міняє висоту компонентів в залежності від того, чи є на сторінці інші компоненти
    if (component === 'birthdays') {
      
      if (window.ads.length > 0) {
        return {height: '85%'};
      } else {
        return {height: '100%'};
      }
    }

    if (component === 'plhk_ads') {
      if (window.birthdays.length > 0) {
        return {height: '15%'};
      } else {
        return {height: '100%'};
      }
    }
  };

  render() {
    return (
      <>
        <If condition={window.birthdays.length > 0}>
          <div style={this.getStyle('birthdays')}>
            <Birthdays />
          </div>
        </If>
        <If condition={window.ads.length > 0}>
          <div style={this.getStyle('plhk_ads')} />
        </If>
      </>
    );
  }
}

ReactDOM.render(<Plhk_ads />, document.getElementById('plhk_ads'));
