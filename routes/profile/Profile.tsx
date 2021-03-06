import * as React from 'react';
import * as mobx from 'mobx';
import * as guid from 'uuid';
import { observer } from 'mobx-react';
import { Link } from 'react-router';
import { Input } from 'components/form';
import { IpfsImage } from 'components';
import { nonEmpty, email, hasChanged } from 'components/form/Constraint';
import Button from "components/Button";
import { layoutState } from 'routes/layout/Layout';
import Loader from 'graph/Loader';
import db from 'graph/IpfsApiStore';

//Profile 
import RoomEditor from './visuals/RoomEditor';
import StuffEditor from './visuals/StuffEditor';
import EditButtons from './visuals/EditButtons';

//models 
import { EditableRoom, EditableUser } from "models";

const Document = require('./Profile.gql');



class ProfileState extends Loader {
    @mobx.observable user: EditableUser;

    get room(): EditableRoom {
        if (this.user) return this.user.room;
        return null;
    }
    createRoom() {
        this.user.room = new EditableRoom(null, this.user._id);
    }
    // save potential changes in the profile
    saveChanges: Function = () => {
        if (this.user.hasChanged) {
            this.user.save();
        }
        if (this.room && this.room.hasChanged) {
            this.room.update();
        }
        this.room.stuffs.forEach(s => s.hasChanged ? s.save() : '');
    };

    @mobx.computed get toolbar() {
        const DashBoard = this.room ? <Link className="btn" to="/dashboard">Dashboard</Link> : null;
        const SaveButton =
            this.user && this.user.hasChanged ||
                this.room && this.room.hasChanged && this.room.isValid ||
                this.room && this.room.stuffs && this.room.stuffs.some(s => !!s.hasChanged) ?
                <Button
                    message="Save"
                    action={_ => this.saveChanges()}
                    appear
                /> : null;
        const CreateRoom = this.user && this.user.room ? null :
            <Button
                message="Add a room"
                action={_ => this.createRoom()}
                appear
            />;
        return [ DashBoard, SaveButton, CreateRoom ];
    }
    loadProfile() {
        this.execute('ProfileQuery', {
            variables: { id: layoutState.userId },
            cb: (data: any) => {
                const { profile } = data;
                if (!profile) throw 'oops, profile hasnt been fetched';
                this.user = new EditableUser(profile);
            }
        });
    }
}
// TODO see if the execute should not only happen in the willMount cb of the component
export const profileState = new ProfileState(Document);

@observer
export default class Profile extends React.Component<any, any> {
    componentWillMount() {
        console.log(layoutState.userId);
        profileState.loadProfile();
        layoutState.reset();
        layoutState.title = "Profile";
        layoutState.backgroundImage = "https://vanessaberryworld.files.wordpress.com/2013/10/teen-room-desk.jpg";
        mobx.autorun(_ => layoutState.setToolbar(profileState.toolbar))
    }

    @mobx.computed get categories() {
        const categories = {};
        (profileState.room.stuffs || []).map(s => categories[s.category.value] ? categories[s.category.value].push(s) : categories[s.category.value] = [s])
        return categories;
    }

    get categoriesElement() {
        const onClose = (stuff) => {
            const index = profileState.room.stuffs.findIndex(s => stuff._id === s._id);
            profileState.room.stuffs.splice(index, 1);
        };
        return profileState.room ?
            Object.keys(this.categories).sort((a, b) => a > b ? 1 : 0).map(key => (
                <div key={key} className="category card">
                    <h2>{key}</h2>
                    <table className='profile-stuffs'>
                        <tbody>
                            {this.categories[key].map(s => (
                                <tr key={s._id} className="stuff">
                                    <td>
                                        <i className="material-icons close" onClick={e => s.delete(_ => onClose(s))}>close</i>
                                    </td>
                                    <td className="name">
                                        <Input type="text" field={s.name} placeholder="name" />
                                    </td>
                                    <td className="description">
                                        <Input type="text" field={s.description} placeholder="description" />
                                    </td>
                                    <td className="price">
                                        <Input type="number" field={s.price} placeholder="price" min={0} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )) :
            null
    }

    render() {
        const { user } = profileState;
        if (!user) return <span />;
        return (
            <div className="profile">
                <div className="profile">
                    <div className="profile-header">
                        <IpfsImage
                            onUpload={(err, hash) => {
                                user.picture.value = hash;
                                user.picture.hasChanged = true;
                            }}
                            defaultPicture="https://www.educol.net/coloriage-che-guevara-dl24689.jpg"
                            picture={user.picture}
                            className="user-picture"
                        />
                        <div className="user-information card">
                            <h2>Profile Information</h2>
                            <Input
                                field={user.name}
                                type="text"
                                placeholder="name"
                            />
                            <Input
                                field={user.email}
                                type="email"
                                placeholder="email"
                            />
                        </div>
                    </div>
                    <div className='profile-room'>
                        {user.room ? <RoomEditor { ...user } /> : null}
                        {this.categoriesElement}
                    </div>
                </div>
            </div>
        )
    }
}

import './Profile.scss';
