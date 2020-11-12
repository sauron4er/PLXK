'use strict';
import React from 'react';
import 'static/css/files_uploader.css';
import 'static/css/loader_style.css';
import 'static/css/my_styles.css';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {notify} from 'templates/components/my_extras';
import {Loader} from 'templates/components/loaders';
import {axiosGetRequest, axiosPostRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
import ordersCalendarStore from 'docs/templates/docs/orders/calendar/orders_calendar_store';
import CalendarItem from 'docs/templates/docs/orders/calendar/calendar_item';
import order from 'docs/templates/docs/orders/order';
import ConstantCalendarItem from "docs/templates/docs/orders/calendar/constant_calendar_item";

const getMonthName = (month) => {
  switch (month) {
    case 0:
      return 'січня';
    case 1:
      return 'лютого';
    case 2:
      return 'березня';
    case 3:
      return 'квітня';
    case 4:
      return 'травня';
    case 5:
      return 'червня';
    case 6:
      return 'липня';
    case 7:
      return 'серпня';
    case 8:
      return 'вересня';
    case 9:
      return 'жовтня';
    case 10:
      return 'листопада';
    case 11:
      return 'грудня';
  }
};

class OrdersCalendar extends React.Component {
  state = {
    loading: false
  };

  componentDidMount() {
    this.getCalendar();
    this.setState({loading: true});
  }

  getCalendar = () => {
    axiosGetRequest('get_calendar/')
      .then((response) => {
        ordersCalendarStore.calendar = response.calendar;
        ordersCalendarStore.is_admin = response.is_admin;
        this.setState({loading: false});
      })
      .catch((error) => notify(error));
  };

  render() {
    const {loading} = this.state;
    const {calendar} = ordersCalendarStore;

    return (
      <Choose>
        <When condition={!loading}>
          <Choose>
            <When condition={calendar?.length === 0}>
              <div>Схоже, у вашому календарі пусто.</div>
            </When>
            <Otherwise>
              <For each='day' index='day_idx' of={calendar}>
                <div key={day_idx} className='mb-3 p-1 border shadow rounded'>
                  <div className='css_calendar_header'>{day.date}</div>
                  <For each='order' index='order_idx' of={day.orders}>
                    <If condition={order.articles.length > 0}>
                      <div key={order_idx} className='css_calendar_card'>
                        <a
                          className='font-weight-bold mb-2 mx-1'
                          href={order.id}
                        >{`${order.type} № ${order.order_code} "${order.order_name}"`}</a>
                        <For each='article' index='article_idx' of={order.articles}>
                          <Choose>
                            <When condition={article.constant}>
                              <ConstantCalendarItem day_index={day_idx} order_index={order_idx} article_index={article_idx} />
                            </When>
                            <Otherwise>
                              <CalendarItem day_index={day_idx} order_index={order_idx} article_index={article_idx} />
                            </Otherwise>
                          </Choose>
                          <hr className='m-1' />
                        </For>
                      </div>
                    </If>
                  </For>
                </div>
              </For>
            </Otherwise>
          </Choose>
          {/*Вспливаюче повідомлення*/}
          <ToastContainer />
        </When>
        <Otherwise>
          <Loader />
        </Otherwise>
      </Choose>
    );
  }
}

export default view(OrdersCalendar);
