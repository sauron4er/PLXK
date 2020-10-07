import React from 'react';
import OneSeatNode from './one_seat_node';

class DepartmentNode extends React.Component {
  render() {
    const {id, data} = this.props;

    return (
      <>
        <div style={{border: '1px solid #e6e9ec', padding: '5px', background: '#e6e9ec', width: 270}}>
          <For each='dep' index='idx' of={data}>
            <div key={idx} id={'accordion_' + id + idx} style={{width: 260}}>
              <div className='card mb-2 p-1'>
                <div
                  className='card-header bg-white'
                  id={'heading_' + id + idx}
                  data-toggle='collapse'
                  data-target={'#collapse_' + id + idx}
                  aria-expanded='false'
                  aria-controls='collapseOne'
                >
                  {dep.name}
                </div>
                <div
                  id={'collapse_' + id + idx}
                  className='collapse'
                  aria-labelledby={'heading_' + id + idx}
                  data-parent={'#accordion_' + id + idx}
                >
                  <div>
                    <For each='seat' index='seat_idx' of={dep.seats}>
                      <OneSeatNode key={seat_idx} data={{name: seat.name, seat_id: seat.seat_id}}/>
                    </For>
                  </div>
                </div>
              </div>
            </div>
          </For>
        </div>
      </>
    );
  }
}

export default DepartmentNode;
