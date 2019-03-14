"use strict";
import React, { Fragment } from "react";
import axios from "axios";
import FreeTime from "./doc_forms/free_time";
import CarryOut from "./doc_forms/carry_out";
import WorkNote from "./doc_forms/work_note";
import Decree from "./doc_forms/decree/decree";
import NewDocument from "./new_document/new_document";
import "../_else/my_styles.css";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.headers.put["Content-Type"] =
  "application/x-www-form-urlencoded, x-xsrf-token";

class NewDoc extends React.Component {
  state = {
    new_doc_types: window.new_docs,
    new_doc_type_id: 0,
    new_doc_type: ""
  };

  onChange = event => {
    if (event.target.name === "new_doc_type") {
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        new_doc_type_id: parseInt(event.target.options[selectedIndex].getAttribute(
          "data-key"
        )),
        new_doc_type: event.target.options[selectedIndex].getAttribute("value")
      });
    }
  };

  // обнуляє селект при закритті модального вікна
  onCloseModal = () => {
    this.setState({
      new_doc_type: 0
    });
  };

  render() {
    const { new_doc_types, new_doc_type_id } = this.state;
    return (
      <Fragment>
        <form className="form-inline">
          <div className="form-group mb-1">
            <label className="font-weight-bold mr-1">
              Створити новий документ:
            </label>
            <select
              className="form-control"
              id="new-doc-type-select"
              name="new_doc_type"
              value={new_doc_type_id}
              onChange={this.onChange}
            >
              <option key={0} value={0}>
                ---------------------
              </option>
              {new_doc_types.map(type => {
                return (
                  <option
                    key={type.id}
                    data-key={type.id}
                    value={type.description}
                  >
                    {type.description}
                  </option>
                );
              })}
            </select>
          </div>
        </form>
        <Choose>
          <When condition={new_doc_type_id === 0}> </When>
          <When condition={new_doc_type_id === 1}>
            <FreeTime
              addDoc={this.props.addDoc}
              onCloseModal={this.onCloseModal}
            />
          </When>
          <When condition={new_doc_type_id === 2}>
            <CarryOut
              addDoc={this.props.addDoc}
              onCloseModal={this.onCloseModal}
            />
          </When>
          <When condition={new_doc_type_id === 3}>
            <WorkNote
              addDoc={this.props.addDoc}
              onCloseModal={this.onCloseModal}
            />
          </When>
          {/*<When condition={new_doc_type === 4}>*/}
          {/*<Decree*/}
          {/*addDoc={this.props.addDoc}*/}
          {/*onCloseModal={this.onCloseModal}*/}
          {/*/>*/}
          {/*</When>*/}
          <Otherwise>
            <NewDocument docType={new_doc_type_id} />
          </Otherwise>
        </Choose>
      </Fragment>
    );
  }
}

export default NewDoc;
