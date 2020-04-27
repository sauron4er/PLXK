"use strict";
import React from "react";
import axios from "axios";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.headers.put["Content-Type"] = "application/x-www-form-urlencoded, x-xsrf-token";

class Laws extends React.Component {
  state = {
    data_received: false
  };

  componentDidMount() {
    this.setState({
      data_received: true
    });
  }

  render() {
    const { data_received } = this.state;

    if (data_received) {
      return <>
        <div>Закони</div>
      </>;
    } else {
      return (
        <div className='css_loader'>
          <div className='loader' id='loader-1'>
            {" "}
          </div>
        </div>
      );
    }
  }

  static defaultProps = {};
}

export default Laws;
