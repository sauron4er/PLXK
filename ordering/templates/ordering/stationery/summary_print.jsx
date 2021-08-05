'use strict';
import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPrint} from '@fortawesome/free-solid-svg-icons';
import ReactToPrint from 'react-to-print';
import {getIndexByProperty} from 'templates/components/my_extras';

class SummaryPrint extends React.PureComponent {
  hideStyle = {
    display: 'none'
  };

  printWindowStyle = {
    padding: '10px'
  };

  getOrders = () => {
    const {summary, header} = this.props;

    let items = [];

    for (const [key, value] of Object.entries(summary)) {
      if (!['id', 'department'].includes(key)) {
        const header_index = getIndexByProperty(header, 'name', parseInt(key));
        items.push(
          <div key={key}>
            {header[header_index].title} – {value}
          </div>
        );
      }
    }
    return (
      <>
        {items.map((item) => {
          return item;
        })}
      </>
    );
  };

  render() {
    const {summary, month, header} = this.props;

    return (
      <>
        <ReactToPrint
          trigger={() => (
            <a href='#' className='text-dark'>
              <FontAwesomeIcon icon={faPrint} />
            </a>
          )}
          content={() => this.componentRef}
          pageStyle={this.printWindowStyle}
        />

        <div ref={(el) => (this.componentRef = el)}>
          <h5 className='text-center mx-5'>
            Замовлення канцелярії на {month.month_name} {month.year} р.
          </h5>
          <h5 className='text-center font-weight-bold'>{summary.department}</h5>
          <hr />
          {this.getOrders()}
        </div>
      </>
    );
  }

  static defaultProps = {
    summary: {},
    month: '',
    header: []
  };
}

export default SummaryPrint;
