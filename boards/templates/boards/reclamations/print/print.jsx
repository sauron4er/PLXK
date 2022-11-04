'use strict';
import * as React from 'react';
import ReactToPrint from 'react-to-print';
import {view, store} from '@risingstack/react-easy-state';
import reclamationsStore from 'boards/templates/boards/reclamations/store';
import ReclamationPrintItem from 'boards/templates/boards/reclamations/print/print_item';
import ReclamationPrintRow from 'boards/templates/boards/reclamations/print/print_row';
import ReclamationPrintColumn from 'boards/templates/boards/reclamations/print/print_column';
import ReclamationPrintSign from 'boards/templates/boards/reclamations/print/print_sign';

class ReclamationPrint extends React.Component {
  hideStyle = {
    display: 'none'
  };

  render() {
    const {reclamation} = reclamationsStore;

    return (
      <>
        <ReactToPrint
          trigger={() => (
            <button className='btn btn-sm btn-outline-dark' onClick={this.openModal}>
              Зберегти в PDF
            </button>
          )}
          content={() => this.componentRef}
        />

        <div style={this.hideStyle}>
          <div ref={(el) => (this.componentRef = el)} className='PrintSection'>
            <div className='col-lg-9 border border-dark rounded mr-2 p-0 '>
              <ReclamationPrintColumn>
                {/*Шапка*/}
                <div className='d-flex border-bottom border-dark align-items-center'>
                  <div className='col-md-3'>
                    <img src='/static/img/logo.png' alt='PLXK' width='50' />
                    <span className='font-weight-bold'>ТДВ "ПЛХК"</span>
                  </div>
                  <div className='col-md-6 border-left border-right border-dark'>
                    <h4 className='font-weight-bold text-center'>РЕКЛАМАЦІЯ</h4>
                    {/*<h6 className='text-center'>NON-CONFORMITY REGISTRATION ACT</h6>*/}
                  </div>
                  <div className='col-md-3'></div>
                </div>

                {/*Перша фаза*/}
                <ReclamationPrintColumn className='p-1'>
                  <ReclamationPrintRow>
                    <ReclamationPrintItem cols={6} position='left' ua='№ в базі' value={reclamation.id} />
                    <ReclamationPrintItem cols={6} position='right' ua='Дата отримання' value={reclamation.date_received} />
                  </ReclamationPrintRow>
                  <ReclamationPrintRow>
                    <ReclamationPrintItem cols={6} position='left' ua='Ініціатор' value={reclamation.author_name} />
                    <ReclamationPrintItem cols={6} position='right' ua='Начальник підрозділу' value={reclamation.dep_chief_name} />
                  </ReclamationPrintRow>
                  <ReclamationPrintRow>
                    <div className='col-7 p-0'>
                      <ReclamationPrintItem ua='Клієнт' value={reclamation.client_name} />
                      <ReclamationPrintItem className='mt-1' ua='Продукція' value={reclamation.product_name} />
                    </div>
                    <div className='col-5 p-0'>
                      <ReclamationPrintColumn>
                        <ReclamationPrintItem position='right' ua='№ автомобіля' value={reclamation.car_number} />
                        <ReclamationPrintItem className='mt-1' position='right' ua='Тип продукції' value={reclamation.product_type_name} />
                      </ReclamationPrintColumn>
                    </div>
                  </ReclamationPrintRow>
                  <ReclamationPrintRow>
                    <ReclamationPrintItem
                      cols={6}
                      position='left'
                      ua='Причина невідповідності'
                      en='Reason of non-conformity'
                      value={reclamation.reason}
                    />
                    <div className='col-6 p-0'>
                      <ReclamationPrintColumn>
                        <ReclamationPrintItem position='right' ua='Дата виробництва' value={reclamation.date_manufacture} />
                        <ReclamationPrintItem className='mt-1' position='right' ua='Дата відгрузки' value={reclamation.date_shipment} />
                      </ReclamationPrintColumn>
                    </div>
                  </ReclamationPrintRow>
                  <ReclamationPrintColumn>
                    <ReclamationPrintItem position='center' ua='Підписи'></ReclamationPrintItem>
                    <ReclamationPrintRow last>
                      <ReclamationPrintSign cols={4} role='Автор' role_en='' name={reclamation.author_name} />
                      <ReclamationPrintSign cols={4} role='Нач. підрозділу' role_en='' name={reclamation.dep_chief_name} />
                      <ReclamationPrintSign cols={4} role='Директор з якості' role_en='' name={reclamation.quality_director_name} />
                    </ReclamationPrintRow>
                  </ReclamationPrintColumn>
                </ReclamationPrintColumn>

                {/*Друга фаза*/}
                <ReclamationPrintColumn className='border-top border-dark p1'>
                  <h4 className='border-bottom border-dark text-center font-weight-bold py-3'>Рішення</h4>
                  <ReclamationPrintRow>
                    <ReclamationPrintItem
                      position='left'
                      ua='Особа, відповідальна за прийняття рішення щодо подальших дій'
                      value={reclamation.final_decisioner}
                    />
                  </ReclamationPrintRow>
                  <ReclamationPrintRow last>
                    <ReclamationPrintItem cols={6} position='left' ua='Рішення' value={reclamation.final_decision} />
                    <ReclamationPrintItem cols={6} position='right' ua='Дата рішення' value={reclamation.final_decision_time} />
                  </ReclamationPrintRow>
                  <ReclamationPrintColumn>
                    <ReclamationPrintItem position='right' ua='Підпис'></ReclamationPrintItem>
                    <ReclamationPrintRow last right>
                      <ReclamationPrintSign cols={4} />
                    </ReclamationPrintRow>
                  </ReclamationPrintColumn>
                </ReclamationPrintColumn>

                {/*Третя фаза*/}
                <ReclamationPrintColumn className='border-top border-dark p-1'>
                  <h4 className='border-bottom border-dark text-center font-weight-bold py-3'>Виконання</h4>
                  <ReclamationPrintRow>
                    <ReclamationPrintItem
                      position='left'
                      ua='Відділ,відповідальний за надання відповіді'
                      value={reclamation.answer_responsible_dep_name}
                    />
                  </ReclamationPrintRow>
                  <ReclamationPrintRow last>
                    <ReclamationPrintItem
                      position='left'
                      ua='Відповідальний за оформлення рішення комісії'
                      value={reclamation.responsible_name}
                    />
                  </ReclamationPrintRow>
                  <ReclamationPrintColumn>
                    <ReclamationPrintItem position='right' ua='Підпис'></ReclamationPrintItem>
                    <ReclamationPrintRow last right>
                      <ReclamationPrintSign cols={4} />
                    </ReclamationPrintRow>
                  </ReclamationPrintColumn>
                </ReclamationPrintColumn>
              </ReclamationPrintColumn>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default view(ReclamationPrint);
