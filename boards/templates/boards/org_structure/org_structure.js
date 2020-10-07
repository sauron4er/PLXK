'use strict';
import React from 'react';
import 'static/css/my_styles.css';
import ReactFlow from 'react-flow-renderer';
import Modal from 'react-responsive-modal';
import {view, store} from '@risingstack/react-easy-state';
import orgStructureStore from './org_structure_store';
import OneSeatNode from './one_seat_node';
import DepartmentNode from './department_node';
import SeatCard from './seat_card';
import structure_data from './structure_data'

const nodeTypes = {
  oneSeatNode: OneSeatNode,
  departmentNode: DepartmentNode
};

class OrgStructure extends React.Component {
  state = {
    clicked_seat_id: 0,
    seat_info_opened: false
  };

  componentDidMount() {
    this.setState({elements: structure_data});
  }

  onModalClose = () => {
    orgStructureStore.modal_opened = false;
    orgStructureStore.clicked_seat = 0;
  };

  render() {
    const {elements} = this.state;
    const {modal_opened} = orgStructureStore;
    return (
      <div className='text-center'>
        <h2>Організаційна структура ПЛХК</h2>
        <div>Натисніть на посаду, щоб відкрити більше інформації</div>
        <ReactFlow
          defaultZoom={0.8}
          className='border border-dark mt-2'
          elements={elements}
          style={{width: '100%', height: '790px'}}
          // onElementClick={this.onClickElem}
          nodesDraggable={false}
          nodeTypes={nodeTypes}
        />
        <Modal open={modal_opened} onClose={this.onModalClose} center>
          <SeatCard />
        </Modal>
      </div>
    );
  }
}

export default view(OrgStructure);
