'use strict';
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import Users from './users';
import Deps from './deps';
import Seats from './seats';
import '../_else/my_styles.css';

class HR extends React.Component {
  state = {
    emps: window.emps,
    seats: window.seats,
    deps: window.deps,
    main_div_height: 0 // розмір головного div, з якого вираховується розмір таблиць
  };

  componentDidMount() {
    this.setState({main_div_height: this.mainDivRef.clientHeight - 30});
  }

  // Отримує ref основного div для визначення його висоти і передачі її у DxTable
  getMainDivRef = (input) => {
    this.mainDivRef = input;
  };

  changeLists = (name, list) => {
    if (name === 'deps') {
      this.setState({
        deps: list
      });
      console.log('asd');
    } else if (name === 'emps') {
      this.setState({
        emps: list
      });
    } else if (name === 'seats') {
      this.setState({
        seats: list
      });
    }
  };

  notify = (message) =>
    toast.error(message, {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });

  render() {
    const {main_div_height} = this.state;
    return (
      <Fragment>
        <div className='row css_main_div' ref={this.getMainDivRef}>
          <div className='col-lg-4 p-2'>
            <Users
              emps={this.state.emps}
              seats={this.state.seats}
              changeLists={this.changeLists}
              height={main_div_height}
            />
          </div>
          <div className='col-lg-4 p-2'>
            <Deps
              deps={this.state.deps}
              changeLists={this.changeLists}
              height={main_div_height}
            />
          </div>
          <div className='col-lg-4 p-2'>
            <Seats
              seats={this.state.seats}
              deps={this.state.deps}
              changeLists={this.changeLists}
              height={main_div_height}
            />
          </div>
        </div>

        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </Fragment>
    );
  }
}

ReactDOM.render(<HR />, document.getElementById('hr'));
