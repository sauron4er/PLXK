'use strict';
import * as React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Archive from 'edms/templates/edms/archive/archive';

class Reloader extends React.Component {
  state = {
    birthdays: window.birthdays,
    ads: window.ads
  };

  componentWillMount() {
    // this.reload();
    this.interval = setInterval(() => this.reload(), 5*60*1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  compareLists = (new_lists) => {
    // Якщо кількість днів народжень змінилася - оновлюємо
    if (this.state.birthdays.length !== new_lists.birthdays.length) {
      location.reload();
    }

    // У оновленому листі не може бути вчорашніх ід. Оновлюємо
    if (new_lists.birthdays.length !== 0) {
      if (this.state.birthdays[1].id !== new_lists.birthdays[1].id) {
        location.reload();
      }
    }

    // при зміні кількості повідомлень, оновлюємо
    if (this.state.ads.length !== new_lists.ads.length) {
      location.reload();
    }

    // якщо котрась із ід повідомлень змінилася - оновлюємо
    if (this.state.ads.length !== 0 && new_lists.ads.length !== 0) {
      for (let i = 0; i < this.state.ads; i++) {
        if (this.state.ads[i].id !== new_lists.ads[i].id) {
          location.reload();
        }
      }
    }
  };

  reload = () => {
    axios({
      method: 'get',
      url: '/reload/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        this.compareLists(response.data);
      })
      .catch(function(error) {
        console.log('errorpost: ' + error);
      });
  };

  render() {
    return null;
  }
}

// ReactDOM.render(<Reloader />, document.getElementById('reloader'));

export default Reloader;