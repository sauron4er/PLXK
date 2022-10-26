'use strict';
import React, {useRef} from 'react';
import ReactToPrint from 'react-to-print';
import {view, store} from '@risingstack/react-easy-state';
import 'static/css/print_order.css';
import ordersStore from 'docs/templates/docs/orders/orders_store';
import div from 'boards/templates/boards/non_compliances/non_compliance/item';

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
          <div className='order'>
            <div className='order_company'>
              {order.company === 'ТДВ' ? 'ТДВ «Перечинський лісохімічний комбінат»' : 'ТОВ «Перечинський лісохімічний комбінат»'}
            </div>
            <div className='order_number'>
              {order.type_name === 'Розпорядження'
                ? `Р О З П О Р Я Д Ж Е Н Н Я`
                : order.type_name === 'Протокол'
                ? `П Р О Т К О Л`
                : `Н А К А З`}
              <span className='order_code'>№ {order.code}</span>
            </div>
            <div className='date_and_place'>
              <div className='order_date'>«___» ____________ ____ р.</div>
              <div className='order_date'>м. Перечин</div>
            </div>
            <div className='order_name'>{order.name}</div>
            <div className='order_preamble'>{order.preamble}</div>
            <div className='order_ordering'>Н А К А З У Ю:</div>
            <ol className='order_article_list'>
              <If condition={order.articles}>
                <For each='article' of={order.articles} index='article_idx'>
                  <li key={article_idx} className='order-article' dangerouslySetInnerHTML={{__html: article.text}} />
                </For>
              </If>
            </ol>
            <div className="order_director">
              {/*<Choose></Choose>*/}
            </div>
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
