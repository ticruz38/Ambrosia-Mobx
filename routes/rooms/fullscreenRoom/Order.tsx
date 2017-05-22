import * as React from "react";
import { Link } from 'react-router';

import { EditableOrder } from "models";
import { Input } from 'components/form';
import { Button } from "components";
import { layoutState } from "routes/layout/Layout";

import { RoomState } from './FullscreenRoom';

type props = {
    roomState: RoomState,
    router: any,
    params: any
}

export default class Order extends React.Component<props, any> {

    onSave() {
        const { roomState } = this.props;
        roomState.order.create()
        roomState.order = new EditableOrder( null, layoutState.user._id, this.props.params.roomId);
        this.props.router.push( { pathname: '/rooms/' + this.props.params.roomId } )
    }

    sendTransaction() {
        const web3 = layoutState.connect.getWeb3();
        web3.eth.sendTransaction({
            from: layoutState.user._id, 
            to:'0xd156a38ce652de569383df1b458400b5ebb1c808', 
            value: web3.toWei(0.05, "ether")
        }, (err, result ) => {
            console.log(err, result );
        } )
        console.log(web3);
    }

    render() {
        const { roomState } = this.props;
        return (
            <div className="order">
                <h3>You are about to order </h3>
                <table>
                    <thead>
                        <tr>
                            <td>times</td>
                            <td>category</td>
                            <td>name</td>
                            <td>description</td>
                            <td>price</td>
                        </tr>
                    </thead>
                    <tbody>
                        {roomState.stuffs.map( s =>
                            <tr>
                                <td>{s[0]}</td>
                                <td>{s[1].category}</td>
                                <td>{s[1].name}</td>
                                <td>{s[1].description}</td>
                                <td>{s[1].price || 'free'}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Input
                    type="text"
                    placeholder="Leave a comment"
                    field={ roomState.order.message }
                />
                <div className="buttons">
                    <Link to={ "/rooms/" + this.props.params.roomId } className="btn">Cancel</Link>
                    <Button 
                        message="Order"
                        className="btn" 
                        action={ _ => this.sendTransaction() }
                    />
                </div>
            </div>
        );
    }
}


import './Order.scss';
