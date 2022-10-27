'use strict';
import * as React from 'react';
import ReactToPrint from 'react-to-print';
import {view, store} from '@risingstack/react-easy-state';
import nonComplianceStore from '../non_compliance_store';
import div from 'boards/templates/boards/non_compliances/non_compliance/item';
import NCPrintItem from 'boards/templates/boards/non_compliances/print/print_item';
import NCPrintRow from 'boards/templates/boards/non_compliances/print/print_row';
import NCPrintColumn from 'boards/templates/boards/non_compliances/print/print_column';
import NCPrintSign from 'boards/templates/boards/non_compliances/print/print_sign';

class NCPrint extends React.Component {
  hideStyle = {
    display: 'none'
  };

  render() {
    const {non_compliance} = nonComplianceStore;

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
              <NCPrintColumn>
                {/*Шапка*/}
                <div className='d-flex border-bottom border-dark align-items-center'>
                  <div className='col-md-3'>
                    <img src='/static/img/logo.png' alt='PLXK' width='50' />
                    <span className='font-weight-bold'>ТДВ "ПЛХК"</span>
                  </div>
                  <div className='col-md-6 border-left border-right border-dark'>
                    <h4 className='font-weight-bold text-center'>АКТ НЕВІДПОВІДНОСТІ</h4>
                    <h6 className='text-center'>NON-CONFORMITY REGISTRATION ACT</h6>
                  </div>
                  <div className='col-md-3'></div>
                </div>

                {/*Перша фаза*/}
                <NCPrintColumn className='p-1'>
                  <NCPrintRow>
                    <NCPrintItem cols={6} position='left' ua='N° реєстрації' en='Registration #' value={non_compliance.id} />
                    <NCPrintItem cols={6} position='right' ua='Дата' en='Date' value={non_compliance.date_added} />
                  </NCPrintRow>
                  <NCPrintRow>
                    <NCPrintItem
                      cols={6}
                      position='left'
                      ua='Підрозділ-ініціатор'
                      en='Initiator department'
                      value={non_compliance.department_name}
                    />
                    <NCPrintItem
                      cols={6}
                      position='right'
                      ua='Начальник підрозділу'
                      en='Chief of department'
                      value={non_compliance.dep_chief_name}
                    />
                  </NCPrintRow>
                  <NCPrintRow>
                    <NCPrintItem cols={7} position='left' ua='Назва' en='Name' value={non_compliance.name} />
                    <div className='col-5 p-0'>
                      <NCPrintColumn>
                        <NCPrintItem className='mt-1' position='right' ua='Вид' en='Type' value={non_compliance.product_name} />
                        <NCPrintItem className='mt-1' position='right' ua='N° партії' en='Batch #' value={non_compliance.party_number} />
                        <NCPrintItem
                          className='mt-1'
                          position='right'
                          ua='N° замовлення'
                          en='Order #'
                          value={non_compliance.order_number}
                        />
                      </NCPrintColumn>
                    </div>
                  </NCPrintRow>
                  <NCPrintRow>
                    <NCPrintItem
                      cols={6}
                      position='left'
                      ua='Причина невідповідності'
                      en='Reason of non-conformity'
                      value={non_compliance.reason}
                    />
                    <div className='col-6 p-0'>
                      <NCPrintColumn>
                        <NCPrintItem position='right' ua='Постачальник' en='Supplier' value={non_compliance.provider_name} />
                        <NCPrintItem
                          className='mt-1'
                          position='right'
                          ua='Тип фасування'
                          en='Filling type'
                          value={non_compliance.packing_type}
                        />
                        <NCPrintItem
                          className='mt-1'
                          position='right'
                          ua='Кількість в партії'
                          en='Batch quantity'
                          value={non_compliance.total_quantity}
                        />
                        <NCPrintItem
                          className='mt-1'
                          position='right'
                          ua='Кількість невідповідного'
                          en='Non-compliance quantity'
                          value={non_compliance.nc_quantity}
                        />
                        <NCPrintItem
                          className='mt-1'
                          position='right'
                          ua='% невідповідності'
                          en='% of non-compliance'
                          value={nonComplianceStore.getNcPercentage()}
                        />
                      </NCPrintColumn>
                    </div>
                  </NCPrintRow>
                  <NCPrintRow>
                    <NCPrintItem
                      cols={6}
                      position='left'
                      ua='Класифікація невідповідності'
                      en='Non-conformity classification'
                      value={non_compliance.classification}
                    />
                    <NCPrintItem cols={6} position='right' ua='Статус' en='Status' value={non_compliance.status} />
                  </NCPrintRow>
                  <NCPrintRow>
                    <NCPrintItem cols={4} position='left' ua='Дефект' en='Defect' value={non_compliance.defect} />
                    <NCPrintItem cols={4} position='center' ua='Сектор' en='Sector' value={non_compliance.sector} />
                    <NCPrintItem
                      cols={4}
                      position='right'
                      ua='Результати аналізу'
                      en='Analysis results'
                      value={non_compliance.analysis_results}
                    />
                  </NCPrintRow>
                  <NCPrintColumn>
                    <NCPrintItem position='center' ua='Підписи' en='Signatures'></NCPrintItem>
                    <NCPrintRow last>
                      <NCPrintSign cols={4} role='Автор' role_en='Author' name={non_compliance.author_name} />
                      <NCPrintSign cols={4} role='Нач. підрозділу' role_en='Chief of department' name={non_compliance.dep_chief_name} />
                      <NCPrintSign
                        cols={4}
                        role='Директор з якості'
                        role_en='Quality Director'
                        name={non_compliance.quality_director_name}
                      />
                    </NCPrintRow>
                  </NCPrintColumn>
                </NCPrintColumn>

                {/*Друга фаза*/}
                <NCPrintColumn className='border-top border-dark p1'>
                  <h4 className='border-bottom border-dark text-center font-weight-bold py-3'>Рішення</h4>
                  <NCPrintRow>
                    <NCPrintItem
                      position='left'
                      ua='Особа, відповідальна за прийняття рішення щодо подальших дій'
                      en='The person responsible for deciding on further action'
                      value={non_compliance.final_decisioner}
                    />
                  </NCPrintRow>
                  <NCPrintRow last>
                    <NCPrintItem cols={6} position='left' ua='Рішення' en='Decision' value={non_compliance.final_decision} />
                    <NCPrintItem
                      cols={6}
                      position='right'
                      ua='Дата рішення'
                      en='Decision date'
                      value={non_compliance.final_decision_time}
                    />
                  </NCPrintRow>
                  <NCPrintColumn>
                    <NCPrintItem position='right' ua='Підпис' en='Signature'></NCPrintItem>
                    <NCPrintRow last right>
                      <NCPrintSign cols={4} />
                    </NCPrintRow>
                  </NCPrintColumn>
                </NCPrintColumn>

                {/*Третя фаза*/}
                <NCPrintColumn className='border-top border-dark p-1'>
                  <h4 className='border-bottom border-dark text-center font-weight-bold py-3'>Виконання</h4>
                  <NCPrintRow>
                    <NCPrintItem
                      position='left'
                      ua='Відповідальний за подальші дії згідно прийнятого рішення '
                      en='The person who is responsible for the further actions concerning the decision'
                      value={non_compliance.responsible_name}
                    />
                  </NCPrintRow>
                  <NCPrintRow>
                    <NCPrintItem
                      cols={8}
                      position='left'
                      ua='Корегуюча / запобіжна дія'
                      en='Corrective/preventive action'
                      value={non_compliance.corrective_action}
                    />
                    <If condition={non_compliance.corrective_action_number}>
                      <NCPrintItem
                        cols={4}
                        position='right'
                        ua='N° реєстрації'
                        en='The registration number'
                        value={non_compliance.corrective_action_number}
                      />
                    </If>
                  </NCPrintRow>
                  <Choose>
                    <When condition={non_compliance.final_decision === 'Переробка'}>
                      <NCPrintRow>
                        <NCPrintItem
                          cols={4}
                          position='left'
                          ua='Дата переробки'
                          en='Date of retreatment'
                          value={non_compliance.retreatment_date}
                        />
                        <NCPrintItem
                          cols={4}
                          position='center'
                          ua='Затрачений час, годин'
                          en='Spent time'
                          value={non_compliance.spent_time}
                        />
                        <NCPrintItem
                          cols={4}
                          position='right'
                          ua='Кількість задіяних осіб'
                          en='Quantity of involved people'
                          value={non_compliance.people_involved}
                        />
                      </NCPrintRow>
                      <NCPrintRow last>
                        <NCPrintItem
                          cols={4}
                          position='left'
                          ua='Корегування залишків продукції'
                          en='Updating of the rest of products'
                          value={non_compliance.quantity_updated}
                        />
                        <NCPrintItem
                          cols={8}
                          position='right'
                          ua='Корегування інформативного статусу'
                          en='Updating of the informative status'
                          value={non_compliance.status_updated}
                        />
                      </NCPrintRow>
                    </When>
                    <When condition={non_compliance.final_decision === 'Повернення постачальнику'}>
                      <NCPrintRow last>
                        <NCPrintItem position='left' ua='Дата повернення' en='Date of return' value={non_compliance.return_date} />
                      </NCPrintRow>
                    </When>
                  </Choose>
                  <NCPrintColumn>
                      <NCPrintItem position='right' ua='Підпис' en='Signature'></NCPrintItem>
                      <NCPrintRow last right>
                        <NCPrintSign cols={4} />
                      </NCPrintRow>
                    </NCPrintColumn>
                </NCPrintColumn>
              </NCPrintColumn>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default view(NCPrint);
