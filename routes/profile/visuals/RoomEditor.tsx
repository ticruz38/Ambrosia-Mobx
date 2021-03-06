import * as React from 'react';
import * as mobx from 'mobx';
import { observer } from 'mobx-react';
import { Input } from 'components/form';
import { Select, Option } from 'components';
//models
import { StuffInput, Field, EditableRoom, EditableStuff, EditableUser } from 'models';
//layout
import { layoutState } from 'routes/layout/Layout';

import Loader from 'graph/Loader';

// Profile
import { profileState } from 'routes/profile/Profile';
import StuffEditor from './StuffEditor';
import { IpfsImage, Button } from "components";
const Tags = require('mocks/Tags.json');

const Document = require('./RoomEditor.gql');



@observer
export default class RoomEditor extends React.Component< any, any > {
    componentWillMount() {
        Loader.execute(Document, 'AllTags').then(result => {
            console.log(result.data, result.errors);
        })
    }
    render() {
        const { room } = this.props;
        return (
            <div className="room-editor card">
                <h2>Room</h2>
                <i className="material-icons close" onClick={ e => room.delete( _ => profileState.user.room = null ) }>close</i>
                <div className="flex-box">
                    <div className="form">
                        <Input field={room.name} type="text" placeholder="name" />
                        <Input field={room.description} type="text" placeholder="description" />
                        <Input field={room.email} type="text" placeholder="email" />
                        <Input field={room.phoneNumber} type="text" placeholder="phone-number" />
                        <Select 
                            placeholder="Add tags..."
                            values={ mobx.observable({
                                options: Tags,
                                filters: room.tags
                            }) }
                            allowCreate
                        />
                    </div>
                    <IpfsImage
                        picture={ room.picture }
                        onUpload={ (err, hash) => {
                            room.picture.value = hash
                            room.picture.hasChanged = true;
                        } }
                        defaultPicture="https://d30y9cdsu7xlg0.cloudfront.net/png/204988-200.png"
                    />
                </div>
                <div className="action-button">
                    <Button
                        message='Add Stuff'
                        action={_ => layoutState.setModal(<StuffEditor roomId={ room._id }/>)}
                    />
                </div>
            </div>
        );
    }
}

import "./RoomEditor.scss";