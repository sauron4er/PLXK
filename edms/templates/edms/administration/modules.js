'use strict';
import React, {Component, Fragment} from 'react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

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
  minHeight: '50%',
  // background: isDraggingOver ? 'azure' : 'honeydew',
  padding: grid,
  border: '1px solid lightgray',
  borderRadius: '5px'
});

class DragNDrop extends Component {
  state = {
    left: this.props.left,
    chosen: this.props.chosen
  };

  /**
   * A semi-generic way to handle multiple lists. Matches
   * the IDs of the droppable container to the names of the
   * source arrays stored in the state.
   */
  id2List = {
    left: 'left',
    chosen: 'chosen'
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

      let state = {items};

      if (source.droppableId === 'chosen') {
        state = {chosen: items};
      }

      this.setState(state);
    } else {
      const result = move(
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
      <Fragment>
        <div>
          <small>Перетягніть у ліву колонку модулі, які будуть використовуватись.</small>
        </div>
        <div>
          <small>
            Черговість використання модулів можна змінювати. Наприклад, модуль "Назва" логічно
            використовувати одним з перших.
          </small>
        </div>
        <hr />

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
                            {item.name}
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
                            {item.name}
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
      </Fragment>
    );
  }
}

export default DragNDrop;
