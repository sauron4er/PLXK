import * as React from 'react';

class Approved extends React.Component {
  render() {
    const {approved, is_active, closed} = this.props;

    return (
      <div className='mt-2'>
        Актуальність:
        <Choose>
          <When condition={approved===null && is_active && !closed}>
            <span className='ml-1 p-1 border bg-warning'>На підписанні</span>
          </When>
          <When condition={approved}>
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
