'use strict';
import React from 'react';
import Name from './name';
import Preamble from './preamble';
import Text from './text';
import Recipient from './recipient'
import Articles from './articles';
import Files from './files';
import Approvals from './approvals';

class Module extends React.Component {
  state = {
    name: ''
  };

  onChange = event => {
    this.setState({[event.target.name]: event.target.value});
  };

  render() {
    
    const {name} = this.state;
    const {moduleName} = this.props;
    return (
      <Choose>
        <When condition={moduleName === 'name'}>
          <Name
            onChange={this.onChange}
            name={name}
          />
        </When>
        <When condition={moduleName === 'preamble'}>
          <Preamble />
        </When>
        <When condition={moduleName === 'text'}>
          <Text />
        </When>
        <When condition={moduleName === 'recipient'}>
          <Recipient />
        </When>
        <When condition={moduleName === 'articles'}>
          {/* Список модулів у Articles через контекст. */}
          <Articles />
        </When>
        <When condition={moduleName === 'files'}>
          <Files />
        </When>
        <When condition={moduleName === 'approvals'}>
          <Approvals />
        </When>
        <Otherwise>
          <div>{moduleName}</div>
        </Otherwise>
      </Choose>
    );
  }

  static defaultProps = {
    moduleName: ''
  };
}

export default Module;
