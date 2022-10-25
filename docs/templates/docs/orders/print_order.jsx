'use strict';
import React, {useRef} from 'react';
import ReactToPrint from 'react-to-print';
import {view, store} from '@risingstack/react-easy-state';
import 'static/css/print_order.css';
import ordersStore from 'docs/templates/docs/orders/orders_store';

import div from 'boards/templates/boards/non_compliances/non_compliance/item';
import NCPrintItem from 'boards/templates/boards/non_compliances/print/print_item';
import NCPrintRow from 'boards/templates/boards/non_compliances/print/print_row';
import NCPrintColumn from 'boards/templates/boards/non_compliances/print/print_column';
import NCPrintSign from 'boards/templates/boards/non_compliances/print/print_sign';

function PrintOrder(props) {
  const reference = useRef(0);
  const hideStyle = {
    display: 'none'
  };

  const order = ordersStore.order;

  console.log(order);

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button className='btn btn-sm btn-outline-dark' onClick={props.openPDFModal}>
            Друк/PDF
          </button>
        )}
        content={() => reference.current}
      />

      <div style={hideStyle}>
        <div ref={(el) => (reference.current = el)} className='PrintSection'>
          <div>
            {/*<img src='/static/img/tdv_blank.jpg' alt='tdv blank' />*/}
            {order.company==='ТДВ' ? 'ТДВ «Перечинський лісохімічний комбінат»' : 'ТОВ'}
            
          </div>
          <div className='order'>
            <div className='order_number'>
              { order.type_name === "Наказ" ? `Н А К А З` : `Р О З П О Р Я Д Ж Е Н Н Я` }<span className='order_code'>№ {order.code}</span>
            </div>
            <div className='date_and_place'>
              <div className='order_date'>«___» ____________ ____ р.</div>
              <div className='order_date'>м. Перечин</div>
            </div>
            <div className='order_name'>{order.name}</div>
            <div className='order_preamble'>{order.preamble}</div>
            <div className='order_ordering'>Н А К А З У Ю:</div>
          </div>
        </div>
      </div>
    </>
  );
}

PrintOrder.defaultProps = {
  openPDFModal: () => {}
};

export default view(PrintOrder);
