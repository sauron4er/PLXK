'use strict';
import React, {useEffect, useState} from 'react';
import {view, store} from '@risingstack/react-easy-state';
import reclamationsStore from 'boards/templates/boards/reclamations/store';
import {ToastContainer} from 'react-toastify';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import ReclamationFirstPhase from "boards/templates/boards/reclamations/reclamation/first_phase";

function Reclamation(props) {
  const [loading, setLoading] = useState(false);
  // const [pdfModalOpen, setPdfModalOpen] = useState(false);

  useEffect(() => {
    if (reclamationsStore.reclamation.id !== 0) {
      getReclamationInfo();
      setLoading(true);
    }
  }, []);

  function getReclamationInfo() {
    axiosGetRequest('get_reclamation/' + reclamationsStore.reclamation.id + '/')
      .then((response) => {
        reclamationsStore.reclamation = response.reclamation;
        reclamationsStore.user_role = response.user_role;
        setLoading(false);
      })
      .catch((error) => notify(error));
  }

  // function openModal() {
  //   setPdfModalOpen(true);
  // }
  //
  // function onCloseModal() {
  //   setPdfModalOpen(false);
  // }

  return (
    <Choose>
      <When condition={!loading}>
        <div className='d-flex mx-3' style={{height: '87vh'}}>
          <div className='col-lg-9 border border-dark rounded mr-2 h-100 p-0 '>
            <div className='d-flex flex-column h-100'>
              <div className='d-flex border-bottom border-dark align-items-center'>
                <div className='col-md-3'>
                  {/*<img src='/static/img/logo.png' alt='PLXK' width='50px' />*/}
                  {/*<span className='font-weight-bold'>ТДВ "ПЛХК"</span>*/}
                </div>
                <div className='col-md-6 border-left border-right border-dark'>
                  <h4 className='font-weight-bold text-center'>РЕКЛАМАЦІЯ</h4>
                  {/*<h6 className='text-center'>NON-CONFORMITY REGISTRATION ACT</h6>*/}
                </div>
                <div className='col-md-3'>
                  {/*<NCPrint />*/}
                </div>
              </div>
              <div className='h-100 overflow-auto'>
                <ReclamationFirstPhase />
                <If condition={reclamationsStore.reclamation.phase > 1}>
                  {/*<NCSecondPhase />*/}
                </If>
                <If condition={reclamationsStore.reclamation.phase > 2}>
                  {/*<NCThirdPhase />*/}
                </If>
              </div>
            </div>
          </div>
          <div className='col-lg-3 border border-dark rounded'>
            {/*<NCComments />*/}
          </div>
        </div>

        {/*<Modal*/}
        {/*  open={pdfModalOpen}*/}
        {/*  onClose={this.onCloseModal}*/}
        {/*  showCloseIcon={false}*/}
        {/*  closeOnOverlayClick={true}*/}
        {/*  styles={{modal: {marginTop: 75, width: '100%', height: '95%'}}}*/}
        {/*>*/}
        {/*  <NCPrint />*/}
        {/*</Modal>*/}

        {/*Вспливаюче повідомлення*/}
        <ToastContainer />
      </When>
      <Otherwise>
        <Loader />
      </Otherwise>
    </Choose>
  );
}

export default view(Reclamation);
