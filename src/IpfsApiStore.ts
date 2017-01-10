import { observable } from 'mobx';
import Schema from './graphql-client/Root';

const Orbitdb = require('orbit-db');
const IpfsApi = require('@haad/ipfs-api');


class IpfsStore {
    nodeID: string;
    orbitdb: any;
    node: any;
    room: Promise< any >;
    stuff: Promise< any >;
    chat: any;

    constructor() {
        this.startOrbitDb();
        this.createDb('room');
        this.createDb('stuff');
    }

    // roomLoaded number between 0 and 1
    roomLoaded: number = 0;

    // stuffLoaded number between 0 and 1
    stuffLoaded: number = 0;

    createDb(dbName: string) {
        this[dbName] = new Promise( (resolve, reject) => {
            const db = this.orbitdb.docstore(dbName);
            db.events.on('ready', _ => resolve(db));
        } )
    }

    startOrbitDb() {
        // IpfsApi is a bridge to the local ipfs client node
        this.node = new IpfsApi();
        // nodeId is the ipfs node identifier
        this.nodeID = this.node.id().then( (config: any) => this.nodeID = config.id );
         // We instantiate Orbit-db with our ipfs client node
        this.orbitdb = new Orbitdb( this.node );
    }
}

export default new IpfsStore();