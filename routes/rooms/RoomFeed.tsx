import * as React                             from "react";

import {computed, observable, toJS, autorun}  from 'mobx'

import { observer }                           from 'mobx-react';

import uiStore                                from '../UiStore';
import { layoutState }                        from '../layout/Layout';
import Loader                                 from 'graph/Loader';

const RoomDocument = require('./RoomFeed.gql');

interface RoomFeedProps {
  router: any;
}


// the main component roomFeedState;
export class RoomFeedState extends Loader {
  
  @observable rooms: Room[] = [];

  @observable columnWidth: number = 300;


  @computed get numberOfColumn(): number {
    return Math.round(uiStore.windowSize[1] / roomFeedState.columnWidth);
  }
}

export const roomFeedState = new RoomFeedState( RoomDocument, 'RoomsQuery' );

@observer
export default class RoomFeed extends React.Component< RoomFeedProps, RoomFeedState > {

  componentWillMount() {
    layoutState.reset();
    layoutState.title = 'Pick a Room you like';
    layoutState.modal = this.props.children;
  }

  componentWillReceiveProps() {
    layoutState.modal = this.props.children
  }

  render(): React.ReactElement<any> {
    //set the array of rooms array
    const columns: Room[][] = [];

    const columnsComponent = (rooms: Room[], index: number) => {
      return (
        <div className='column' key={index}>
          { rooms.filter(room => !!room).map( room => 
            <RoomComponent {...room} key={room._id} onClick={ roomId => this.props.router.push({pathname: '/' + roomId } ) } /> 
          ) }
        </div>
      );
    }    
    //divide rooms array in n distinct array
    for (let i = 0; i < roomFeedState.rooms.length; i++) {
      let column = columns[i % roomFeedState.numberOfColumn];
      column ? column.push(roomFeedState.rooms[i]) : columns.push([roomFeedState.rooms[i]]);
    }
    return (
      <div className='rooms-grid'>
        { columns.map(columnsComponent) }
      </div>
    );
  }
}

const RoomComponent = (props: Room & { onClick: Function }) => {
  return (
    <div className='room-item'>
      <img
        src={ props.picture ? props.picture : 'public/messy_room.jpg' } 
        onClick={ _ => props.onClick(props._id) }
      />
      <h2>{props.name}</h2>
      <p>{props.description}</p>
    </div>
  );
}

import './RoomFeed.scss';

