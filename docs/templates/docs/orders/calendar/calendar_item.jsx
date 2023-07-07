'use strict';
import * as React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'static/css/my_styles.css';
import {notify} from 'templates/components/my_extras';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import ordersCalendarStore from 'docs/templates/docs/orders/calendar/orders_calendar_store';
import ordersStore from 'docs/templates/docs/orders/orders_store';
import SubmitButton from 'templates/components/form_modules/submit_button';

class CalendarItem extends React.Component {
  postDone = (responsible) => {
    axiosPostRequest('responsible_done/' + responsible + '/')
      .then((response) => this.deleteResponsible())
      .catch((error) => notify(error));
  };

  deleteResponsible = () => {
    let {calendar} = ordersCalendarStore;
    const {day_index, order_index, article_index} = this.props;
    calendar[day_index].orders[order_index].articles.splice(article_index, 1);

    if (calendar[day_index].orders[order_index].articles.length === 0) {
      calendar[day_index].orders.splice(order_index, 1);
    }

    if (calendar[day_index].orders.length === 0) {
      calendar.splice(day_index, 1);
    }
  };

  render() {
    const {day_index, order_index, article_index} = this.props;
    const article = ordersCalendarStore.calendar[day_index].orders[order_index].articles[article_index];

    return (
      <div key={article_index} className='css_calendar_article mx-1'>
        <ReactQuill theme='snow' value={article.text} readOnly={true} modules={{toolbar: false}} className='css_read_only' />
        <If condition={ordersStore.view === 'calendar'}>
          <div className='mb-2 font-weight-bold'>{`Виконавець: ${article.responsible_name}`}</div>
        </If>

        <SubmitButton
          className='mt-1 btn-outline-info ml-auto'
          text='Ознайомлений'
          onClick={() => this.postDone(article.responsible)}
        />
      </div>
    );
  }

  static defaultProps = {
    day_index: 0,
    order_index: 0,
    article_index: 0
  };
}

export default view(CalendarItem);
