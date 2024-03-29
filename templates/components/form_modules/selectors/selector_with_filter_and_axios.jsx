'use strict';
import * as React from 'react';
import Select from 'react-select';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import { LoaderMini, LoaderSmall } from "templates/components/loaders";

class SelectorWithFilterAndAxios extends React.Component {
  // Якщо загорнуте в компонент-обгорту, викидує помилку Can't perform a React state update on an unmounted component
  state = {
    list: [],
    loading: true
  };

  componentDidMount() {
    this.getList();
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.listNameForUrl !== this.props.listNameForUrl) {
      this.getList();
    }
  }
  
  getList = () => {
    axiosGetRequest(`get_${this.props.listNameForUrl}'`)
      .then((response) => {
        this.setState({
          list: response,
          loading: false
        });
      })
      .catch((error) => notify(error));
  }
  
  render() {
    const {onChange, fieldName, disabled, classes, value, selectId} = this.props;
    const {loading, list} = this.state;

    return (
      <label className={classes + ' full_width'} htmlFor={selectId}>
        <If condition={fieldName}>{fieldName}:</If>
        <Choose>
          <When condition={!loading}>
            <Select
              options={list}
              onChange={onChange}
              isDisabled={disabled}
              value={value}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
            />
          </When>
          <Otherwise>
            <LoaderMini />
          </Otherwise>
        </Choose>
      </label>
    );
  }

  static defaultProps = {
    listNameForUrl: '',
    fieldName: '',
    valueField: 'name',
    selectedName: '',
    onChange: () => {},
    disabled: true,
    classes: {},
    value: {id: 0, name: ''},
    selectId: 'select'
  };
}

export default SelectorWithFilterAndAxios;
