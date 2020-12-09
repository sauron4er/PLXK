'use strict';
import * as React from 'react';
import 'static/css/my_styles.css';
import {notify} from 'templates/components/my_extras';
import {axiosPostRequest} from 'templates/components/axios_requests';
import {view, store} from '@risingstack/react-easy-state';
// import TextInput from 'templates/components/form_modules/text_input';
// import Files from 'templates/components/form_modules/files';
import ordersCalendarStore from 'docs/templates/docs/orders/calendar/orders_calendar_store';
import SubmitButton from 'templates/components/form_modules/submit_button';

class CalendarItem extends React.Component {

  postDone = (responsible) => {
    axiosPostRequest('responsible_done/' + responsible + '/')
      .then((response) => this.deleteResponsible())
      .catch((error) => notify(error));
  };
  
  deleteResponsible = () => {
    console.log('1');
    let {calendar} = ordersCalendarStore;
    const {day_index, order_index, article_index} = this.props;
    calendar[day_index].orders[order_index].articles.splice(article_index, 1)
    
    if (calendar[day_index].orders[order_index].articles.length === 0) {
      calendar[day_index].orders.splice(order_index, 1)
    }
    
    if (calendar[day_index].orders.length === 0) {
      calendar.splice(day_index, 1)
    }
  };

  // onCommentChange = (e) => {
  //   // let {responsible, index} = this.props;
  //   // responsible.comment = e.target.value;
  //   // responsible.status = 'change';
  //   //
  //   // this.props.onChange(responsible, index);
  // };
  //
  // onFilesChange = (e) => {
  //   let {responsible, index} = this.props;
  //   responsible.files = e.target.value;
  //   responsible.status = 'change';
  //
  //   this.props.onChange(responsible, index);
  // };
  //
  // onFilesDelete = (id) => {
  //   // Необхідно проводити зміни через додаткову перемінну, бо  react-easy-state не помічає змін глибоко всередині перемінних, як тут.
  //   let {responsible, index} = this.props;
  //   for (const i in responsible.files_old) {
  //     if (responsible.files_old[i].id === id) {
  //       responsible.files_old[i].status = 'delete';
  //       break;
  //     }
  //   }
  // };

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

        {/*<TextInput text={article.comment} fieldName={'Коментар'} onChange={this.onCommentChange} maxLength={500} disabled={false} />*/}
        
        {/*<Files*/}
        {/*  oldFiles={article.files_old}*/}
        {/*  newFiles={article.files}*/}
        {/*  fieldName={'Файли'}*/}
        {/*  onChange={this.onFilesChange}*/}
        {/*  onDelete={(id) => this.onFilesDelete(id)}*/}
        {/*  disabled={false}*/}
        {/*/>*/}

        <SubmitButton className='mt-1 btn-outline-info ml-auto' text='Позначити виконаним' onClick={() => this.postDone(article.responsible)} />
        
      </div>
    );
  }

  static defaultProps = {
    day_index: 0,
    order_index: 0,
    article_index: 0,
    order: {}
  };
}

export default view(CalendarItem);
