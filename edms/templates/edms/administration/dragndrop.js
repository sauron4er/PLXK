'use strict';
import React, {Component} from 'react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {faAngleDown} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Item from './dnd_item';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  // console.log(list);
  // console.log(result);
  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  border: '1px solid lightgray',
  borderRadius: '5px',

  // change background colour if dragging
  // background: isDragging ? 'snow' : 'white',
  background: 'white',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = (isDraggingOver) => ({
  minHeight: '20%',
  // background: isDraggingOver ? 'azure' : 'honeydew',
  padding: grid,
  border: '1px solid lightgray',
  borderRadius: '5px'
});

class Modules extends Component {
  state = {
    left: this.props.left,
    chosen: this.props.chosen
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.id !== prevProps.id) {
      this.setState({
        left: this.props.left,
        chosen: this.props.chosen
      });
    }
  }

  /**
   * A semi-generic way to handle multiple lists. Matches
   * the IDs of the droppable container to the names of the
   * source arrays stored in the state.
   */
  id2List = {
    left: 'left',
    chosen: 'chosen'
  };

  /**
   * Moves an item from one list to another list.
   */
  move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    this.props.changeLists(result, this.props.id);
    return result;
  };

  getList = (id) => this.state[this.id2List[id]];

  onDragEnd = (result) => {
    const {source, destination} = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(this.getList(source.droppableId), source.index, destination.index);

      if (source.droppableId === 'chosen') {
        this.setState(
          {
            chosen: items
          },
          () => this.props.changeLists(this.state, this.props.id)
        );
      }
    } else {
      const result = this.move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );

      this.setState({
        left: result.left,
        chosen: result.chosen
      });
    }
  };

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div className='row'>
          <div className='col-6'>
            <Droppable droppableId='chosen'>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                  {this.state.chosen.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <Item item={item} index={index} dndId={'chosen'} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          <div className='col-6'>
            <Droppable droppableId='left'>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                  {this.state.left.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <Item item={item} index={index} dndId={'left'} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    );
  }

  static defaultProps = {
    left: [],
    chosen: [],
    id: ''
  };
}

export default Modules;
