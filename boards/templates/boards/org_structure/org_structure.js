'use strict';
import React from 'react';
import 'static/css/my_styles.css';
import ReactFlow from 'react-flow-renderer';
import OrdinaryNode from './ordinary_node'

const nodeTypes = {
  selectorNode: OrdinaryNode,
};

const blankElementStyle = {style: {width: 0, background: 'transparent'}};

const getData = () => {
  return {data: {label: 'Торговий відділ (їдальня)'}};
};

const elements = [
  {id: '1', data: {label: 'Генеральний директор', id: 1}, type: 'selectorNode', position: {x: 450, y: 50}},
  {id: 'e1-2', source: '1', target: '2', type: 'step'},
  {id: '2', data: {label: 'Директор з виробництва'}, position: {x: 50, y: 120}},
  {id: 'e1-3', source: '1', target: '3', type: 'step'},
  {id: '3', data: {label: 'Головний інженер'}, position: {x: 250, y: 120}},
  {id: 'e1-4', source: '1', target: '4', type: 'step'},
  {id: '4', data: {label: 'Директор з якості та екології'}, position: {x: 450, y: 120}},
  {id: 'e1-5', source: '1', target: '5', type: 'step'},
  {id: '5', ...getData(), position: {x: 650, y: 120}}

  // { id: "e1-5", source: "1", target: "5", type: "step" },
  // { id: "5", data: { label: "" }, position: { x: 800, y: 120 }, ...blankElementStyle },
  // { id: "e5-6", source: "5", target: "6", type: "step" },
  // { id: "6", data: { label: "Відділ розвитку виробництва" }, type: 'output', position: { x: 650, y: 120 } },
  // { id: "e5-7", source: "5", target: "7", type: "step" },
  // { id: "7", data: { label: "Юридично-адміністративний відділ" }, type: 'output', position: { x: 650, y: 190 } },
  // { id: "e5-8", source: "5", target: "8", type: "step" },
  // { id: "8", data: { label: "Відділ кадрів" }, type: 'output', position: { x: 650, y: 280 } },
  // { id: "e5-9", source: "5", target: "9", type: "step" },
  // { id: "9", data: { label: "Бухгалтерія" }, type: 'output', position: { x: 650, y: 330 } },
  // { id: "e5-10", source: "5", target: "10", type: "step" },
  // { id: "10", data: { label: "Відділ інформаційних технологій" }, type: 'output', position: { x: 650, y: 380 } },
  // { id: "e5-11", source: "5", target: "11", type: "step" },
  // { id: "11", data: { label: "Відділ митних операцій" }, type: 'output', position: { x: 650, y: 450 } },
  // { id: "e5-12", source: "5", target: "12", type: "step" },
  // { id: "12", data: { label: "Планово-економічний відділ" }, type: 'output', position: { x: 650, y: 500 } },
  //
  // { id: "e1-13", source: "1", target: "13", type: "step" },
  // { id: "13", data: { label: "" }, position: { x: 1000, y: 120 }, ...blankElementStyle },
  // { id: "e13-14", source: "13", target: "14", type: "step" },
  // { id: "14", data: { label: "Відділ матеріально-технічного забезпечення" }, type: 'output', position: { x: 850, y: 120 } },
  // { id: "e13-15", source: "13", target: "15", type: "step" },
  // { id: "15", data: { label: "Відділ приймання сировини" }, type: 'output', position: { x: 850, y: 210 } },
  // { id: "e13-16", source: "13", target: "16", type: "step" },
  // { id: "16", data: { label: "Служба охорони праці" }, type: 'output', position: { x: 850, y: 280 } },
  // { id: "e13-17", source: "13", target: "17", type: "step" },
  // { id: "17", data: { label: "Пожежна охорона" }, type: 'output', position: { x: 850, y: 330 } },
  // { id: "e13-18", source: "13", target: "18", type: "step" },
  // { id: "18", data: { label: "Господарська дільниця" }, position: { x: 850, y: 380 } },
  //
  // { id: "e18-19", source: "18", target: "19", type: "step" },
  // { id: "19", data: { label: "" }, position: { x: 1000, y: 380 }, ...blankElementStyle },
  // { id: "e19-20", source: "19", target: "20", type: "step" },
  // { id: "20", data: { label: "Медпункт" }, type: 'output', position: { x: 880, y: 430 } },
  // { id: "e19-21", source: "19", target: "21", type: "step" },
  // { id: "21", data: {label: 'Торговий відділ (їдальня)'}, type: 'output', position: { x: 880, y: 480 } },
];

const graphStyles = {width: '100%', height: '800px'};

class OrgStructure extends React.Component {
  state = {};

  onClick = (event, element) => {
    console.log(element);
  };

  render() {
    return (
      <div className='container text-center'>
        <h2>Організаційна структура ПЛХК</h2>
        <div>Натисніть на ___, щоб відкрити більше інформації</div>
        <ReactFlow
          elements={elements}
          style={graphStyles}
          onElementClick={this.onClick}
          nodesDraggable={false}
          nodeTypes={nodeTypes}
        />
        {/*<FlowChartWithState config={{ readonly: true }} initialValue={chartSimple} />*/}
      </div>
    );
  }
}

export default OrgStructure;
