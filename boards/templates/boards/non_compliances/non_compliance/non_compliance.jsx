'use strict';
import * as React from 'react';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import NCFirstPhase from 'boards/templates/boards/non_compliances/non_compliance/first_phase';
import NCSecondPhase from 'boards/templates/boards/non_compliances/non_compliance/second_phase';
import NCThirdPhase from 'boards/templates/boards/non_compliances/non_compliance/third_phase';
import NCComments from 'boards/templates/boards/non_compliances/comments/comments';
import {ToastContainer} from 'react-toastify';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';

class NonCompliance extends React.Component {
  state = {
    loading: false
  };

  componentDidMount() {
    if (nonComplianceStore.non_compliance.id !== 0) {
      this.getNonComplianceInfo();
      this.setState({loading: true});
    }
  }

  getNonComplianceInfo = () => {
    axiosGetRequest('get_non_compliance/' + nonComplianceStore.non_compliance.id + '/')
      .then((response) => {
        nonComplianceStore.non_compliance = response.non_compliance;
        nonComplianceStore.user_role = response.user_role;
        this.setState({loading: false});
      })
      .catch((error) => notify(error));
  };

  render() {
    return (
      <Choose>
        <When condition={!this.state.loading}>
          <div className='d-flex mx-3' ref={this.getMainDivRef} style={{height: '87vh'}}>
            <div className='col-lg-9 border border-dark rounded mr-2 h-100 p-0 '>
              <div className='d-flex flex-column h-100'>
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
                <div className='h-100 overflow-auto'>
                  <NCFirstPhase />
                  <NCSecondPhase />
                  <NCThirdPhase />
                </div>
              </div>
            </div>
            <div className='col-lg-3 border border-dark rounded'>
              <NCComments />
            </div>
          </div>
          {/*Вспливаюче повідомлення*/}
          <ToastContainer />
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    id: 0
  };
}

export default view(NonCompliance);
