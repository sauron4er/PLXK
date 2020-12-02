'use strict';
import * as React from 'react';
import axios from 'axios';

class DocTypeChooser extends React.PureComponent {
  state = {
    doc_types: [],
    doc_type: this.props.docType
  };

  componentDidMount() {
    axios({
      method: 'get',
      url: 'get_doc_types/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then((response) => {
        if (response.data) {
          this.setState({
            doc_types: response.data
          });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  onChange = (event) => {
    if (event.target.name === 'doc_type') {
      const selectedIndex = event.target.options.selectedIndex;
      this.setState({
        doc_type: {
          id: parseInt(event.target.options[selectedIndex].getAttribute('data-key')),
          name: event.target.options[selectedIndex].getAttribute('value')
        }
      });
      this.props.changeDocType({
        id: parseInt(event.target.options[selectedIndex].getAttribute('data-key')),
        name: event.target.options[selectedIndex].getAttribute('value')
      });
    }
  };

  render() {
    const {doc_types, doc_type} = this.state;
    const {label} = this.props;

    return (
      <form className='form-inline'>
        <div className='form-group mb-1'>
          <label className='font-weight-bold mr-1'>{label}</label>
          <select
            className='form-control-sm bg-white'
            id='doc-type-select'
            name='doc_type'
            value={doc_type.name}
            onChange={this.onChange}
          >
            <option key={0} data-key={0} value={''}>
              ---------------------
            </option>
            {doc_types.map((type) => {
              return (
                <option key={type.id} data-key={type.id} value={type.description}>
                  {type.description}
                </option>
              );
            })}
          </select>
        </div>
      </form>
    );
  }

  static defaultProps = {
    label: 'Тип документа',
    docType: {
      id: 0,
      name: ''
    }
  };
}

export default DocTypeChooser;
