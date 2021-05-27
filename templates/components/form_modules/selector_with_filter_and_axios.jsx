'use strict';
import * as React from 'react';
import Select from 'react-select';
import {axiosGetRequest} from 'templates/components/axios_requests';
import {notify} from 'templates/components/my_extras';
import {LoaderSmall} from 'templates/components/loaders';

class SelectorWithFilterAndAxios extends React.Component {
  state = {
    list: [],
    loading: true
  };
  
  componentDidMount() {
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
    const {onChange, fieldName, disabled, classes, value} = this.props;
    const {loading, list} = this.state;

    return (
      <Choose>
        <When condition={!loading}>
          <label className={classes + ' full_width'} htmlFor={fieldName}>
            {fieldName}:
            <Select
              options={list}
              onChange={onChange}
              isDisabled={disabled}
              value={value}
              getOptionLabel ={(option)=>option.name}
              getOptionValue ={(option)=>option.id}
            />
          </label>
        </When>
        <Otherwise>
          <LoaderSmall/>
        </Otherwise>
      </Choose>
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
    value: {label: 0, value: ''}
  };
}

export default SelectorWithFilterAndAxios;
