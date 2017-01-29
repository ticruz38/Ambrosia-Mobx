import * as React from 'react';
import * as classnames from 'classnames';
import { Link } from 'react-router';

import { observable, autorun, extendObservable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { nonEmpty, email, atLeast, atMost } from '../form/Constraint';
import { Textarea, Input, Field } from '../form';
import { layoutState as layout } from '../layout/Layout';
import Loader from '../graphql-client/Loader';
//import ipfs from '../IpfsStore';
import db from '../IpfsApiStore';

const RoomDocument = require('./Room.gql');
const Guid = require('guid');


export class RoomState extends Loader {
    _id: string = Guid.raw();

    @observable name: Field = {
        value: undefined,
        constraints: [ nonEmpty() ],
        isValid: false
    };
    @observable description: Field = {
        value: undefined,
        constraints: [ nonEmpty() ],
        isValid: false
    };
    @observable email: Field = {
        value: undefined,
        constraints: [ nonEmpty() ],
        isValid: false
    };
    @observable phoneNumber: Field = {
        value: undefined,
        constraints: [ nonEmpty() ],
        isValid: false
    };
    @observable picture: string;
    @observable nodeError: string;

    format() {
        return {
            room : {
                _id: this._id,
                name: this.name,
                description: this.description,
                email: this.email,
                phoneNumber: this.phoneNumber,
                picture: this.picture
            }
        }
    }
}

export const roomState = new RoomState( RoomDocument );

@observer
export default class RoomView extends React.Component< any, {isValid: boolean} > {

    @computed get isValid() {
        return roomState.name.isValid &&
        roomState.description.isValid &&
        roomState.email.isValid &&
        roomState.phoneNumber.isValid
    }

    componentWillMount() {
        layout.title = 'Set your room up';
        // observe isValid and set up the toolbar relatively
        autorun( _ => {
            if( this.isValid ) {
                layout.toolBar = (
                    <Link
                        className="button"
                        to="/stuffs"
                        onClick={ _ => roomState.execute( 'AddRoom', roomState.format() ) }
                    >Add some stuffs
                    </Link>
                );
            } else {
                layout.toolBar = null;
            }
        } );
    }

    onDrop(e: any): void {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(e.dataTransfer.files[0]);
        fileReader.onloadend = (e: any) => {
            console.log(e);
        }
    }


    render() {
        return (
            <div className="room" onDrop={ e => this.onDrop(e)} onDragOver={e => e.preventDefault()}>
                <div className="intro-layer"/>
                <form>
                    <Input
                        type='text'
                        field={roomState.name}
                        label='Room Name'
                    />
                    <Textarea
                        field={ roomState.description}
                        label='Tell something about your room'
                        rows={3}
                    />
                    <Input
                        type='email'
                        field={ roomState.email }
                        label='Email Address'
                    />
                    <Input
                        type='tel'
                        field={ roomState.phoneNumber }
                        label='Phone Number'
                    />
                </form>
            </div>
        );
    }
}

import './Room.scss';