'use strict';
import React, {Component} from 'react';
import {faAngleDown} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class Item extends Component {
  render() {
    // dndId - id компонента DragNDrop - без ід відкриття коментарю ітема в одному днд може відкривати коментар в іншому.
    const {item, index, dndId} = this.props;
    return (
        <Choose>
          <When condition={item.description}>
            <div className='accordion' id={'accordion' + dndId + index}>
              <div
                className='d-flex'
                data-toggle='collapse'
                data-target={'#collapse' + dndId + index}
                aria-expanded='false'
                aria-controls={'collapse' + dndId + index}
              >
                {item.name}
                <div className='ml-auto'>
                  <FontAwesomeIcon icon={faAngleDown} />
                </div>
              </div>

              <div id={'collapse' + dndId + index} className='collapse' data-parent={'#accordion' + dndId + index}>
                <small>{item.description}</small>
              </div>
            </div>
          </When>
          <Otherwise>{item.name}</Otherwise>
        </Choose>
    );
  }
}

export default Item;
