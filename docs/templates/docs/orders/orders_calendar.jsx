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
    is_admin: false,
    calendar: [],
    loading: false
  };

  componentDidMount() {
    this.getCalendar();
    this.setState({loading: true});
  }

  getCalendar = () => {
    axiosGetRequest('get_calendar/')
      .then((response) => {
        this.setState({
          calendar: response.calendar,
          is_admin: response.is_admin,
          loading: false
        });
      })
      .catch((error) => notify(error));
  };

  getDate = (day) => {
    const date = new Date(day);
    const today = new Date();
    today.setHours(3, 0, 0, 0);
    const text_color = +date <= +today ? 'red' : '';
    const dayName = `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()} року`;

    return <div style={{color: text_color}}>{dayName}</div>;
  };

  deleteResponsible = (day_idx, order_idx) => {
    const {calendar} = this.state;
    calendar[day_idx].splice(order_idx, 1);
    if (calendar[day_idx].length === 0) calendar.splice(day_idx, 1);
    this.setState({calendar});
  };

  postResponsibleDone = (day_idx, order_idx, responsible) => {
    axiosPostRequest('responsible_done/' + responsible + '/')
      .then((response) => this.deleteResponsible(day_idx, order_idx))
      .catch((error) => notify(error));
  };

  render() {
    const {calendar, is_admin, loading} = this.state;

    console.log(calendar);

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
                    <div key={order_idx} className='css_calendar_card'>
                      <a className='font-weight-bold mb-2 mx-1' href={order.id}>{`Наказ № ${order.order_code} "${order.order_name}"`}</a>
                      <For each='article' index='article_idx' of={order.articles}>
                        <div key={article_idx} className='css_calendar_article mx-1'>
                          <div>{article.text}</div>
                          <If condition={is_admin}>
                            <div className='mb-2 font-weight-bold'>{`Виконавець: ${article.responsible_name}`}</div>
                          </If>
                          <button
                            className='btn btn-sm btn-outline-success ml-auto'
                            onClick={() => this.postResponsibleDone(day_idx, order_idx, article.responsible)}
                          >
                            Позначити виконаним
                          </button>
                          <hr className='m-1 mt-2'/>
                        </div>
                      </For>
                    </div>
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
