'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from './non_compliance_store';
import NCFirstPhase from 'boards/templates/boards/non_compliances/non_compliance/first_phase';
import NCSecondPhase from 'boards/templates/boards/non_compliances/non_compliance/second_phase';
import NCThirdPhase from 'boards/templates/boards/non_compliances/non_compliance/third_phase';
import NCComments from 'boards/templates/boards/non_compliances/non_compliance/comments';
import {ToastContainer} from 'react-toastify';

class NonCompliance extends React.Component {

  render() {
    return (
      <>
        <div className='d-flex mx-3' style={{height: '85vh'}}>
          <div className='col-lg-9 border border-dark rounded mr-2 h-100 p-0'>
            <div className='d-flex flex-column'>
              <div className='d-flex border-bottom border-dark align-items-center'>
                <div className='col-md-3'>
                  <img src='/static/img/logo.png' alt='PLXK' width='50' />
                  <span className='font-weight-bold'>ТДВ "ПЛХК"</span>
                </div>
                <div className='col-md-6 border-left border-right border-dark'>
                  <h4 className='font-weight-bold text-center'>АКТ НЕВІДПОВІДНОСТІ</h4>
                  <h6 className='text-center'>NON-CONFORMITY REGISTRATION ACT</h6>
                </div>
                <div className='col-md-3'> </div>
              </div>
              <NCFirstPhase />
              <NCSecondPhase />
              <NCThirdPhase />
            </div>
          </div>
          <div className='col-lg-3 border border-dark rounded'>
            <NCComments />
          </div>
        </div>
        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </>
    );
  }

  static defaultProps = {
    id: 0
  };
}

export default view(NonCompliance);
