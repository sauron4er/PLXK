'use strict';
import * as React from 'react';
import ReactToPrint from 'react-to-print';
import {view, store} from '@risingstack/react-easy-state';
import ordersCalendarStore from 'docs/templates/docs/orders/calendar/orders_calendar_store';

class OverdueReport extends React.Component {
  hideStyle = {
    display: 'none'
  };

  printWindowStyle = {
    padding: '10px'
  };

  isOverdue = (date_string) => {
    if (date_string) {
      const today = new Date();
      const parts = date_string.split('.');
      // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
      // January - 0, February - 1, etc.
      const mydate = new Date(parts[2], parts[1] - 1, parts[0]);

      return today > mydate;
    }
    return false;
  };

  render() {
    
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    const time =
      ('0' + today.getHours()).slice(-2) + ':' +
      ('0' + today.getMinutes()).slice(-2) + ':' +
      ('0' + today.getSeconds()).slice(-2)
    const today_string = dd + '.' + mm + '.' + yyyy + ' ' + time;
  
    return (
      <>
        <ReactToPrint
          trigger={() => (
            <a href='#'>
              {/*<FontAwesomeIcon icon={faPrint} />*/}
              Звіт по простроченнях
            </a>
          )}
          content={() => this.componentRef}
          pageStyle={this.printWindowStyle}
        />

        <div style={this.hideStyle}>
          <div ref={(el) => (this.componentRef = el)}>
            <img src='../../../../../static/img/blank_header.png' alt='Italian Trulli' style={{width: '100%'}} />
            <h3 className='text-center mt-2'>Звіт по простроченому виконанню наказів</h3>
            <h6 className='text-center mb-2'>{`Станом на ${today_string}`}</h6>
            <For each='day' index='day_idx' of={ordersCalendarStore.calendar}>
              <If condition={this.isOverdue(day.date)}>
                <div style={{border: '1px'}} key='day_idx'>
                  <div className='font-weight-bold'>{day.date}</div>
                  <For each='order' index='order_idx' of={day.orders}>
                    <div className='font-italic' key={order_idx}>{`${order.type} № ${order.order_code} "${order.order_name}"`}</div>
                    <For each='article' index='article_idx' of={order.articles}>
                      <div key={article_idx}>
                        {article.responsible_name}
                      </div>
                    </For>
                  </For>
                </div>
                
                <hr/>
              </If>
            </For>
          </div>
        </div>
      </>
    );
  }
}

export default view(OverdueReport);
