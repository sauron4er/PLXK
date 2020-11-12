'use strict';
import React from 'react';
import 'static/css/my_styles.css';
import {notify} from 'templates/components/my_extras';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import ordersCalendarStore from 'docs/templates/docs/orders/calendar/orders_calendar_store';

class ConstantCalendarItem extends React.Component {
  render() {
    const {day_index, order_index, article_index} = this.props;
    const {is_admin} = ordersCalendarStore;
    const article = ordersCalendarStore.calendar[day_index].orders[order_index].articles[article_index]

    return (
      <div key={article_index} className='css_calendar_article mx-1'>
        <div>{article.text}</div>
        <If condition={is_admin}>
          <div className='mb-2 font-weight-bold'>{`Виконавець: ${article.responsible_name}`}</div>
        </If>
      </div>
    );
  }

  static defaultProps = {
    day_index: 0,
    order_index: 0,
    article_index: 0,
  };
}

export default view(ConstantCalendarItem);
