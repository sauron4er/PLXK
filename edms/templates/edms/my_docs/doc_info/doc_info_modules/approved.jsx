import * as React from 'react';

class Approved extends React.Component {
  render() {
    const {signed} = this.props;
  
    return (
      <div className='mt-2'>
        Актуальність:
        <Choose>
          <When condition={signed===null}>
            <span className='ml-1 p-1 border bg-warning'>На підписанні</span>
          </When>
          <When condition={signed}>
            <span className='ml-1 p-1 border bg-success'>Актуальний</span>
          </When>
          <Otherwise>
            <span className='ml-1 p-1 border bg-danger'>Не актуальний</span>
          </Otherwise>
        </Choose>
      </div>
    );
  }

  static defaultProps = {
    signed: ''
  };
}

export default Approved;
