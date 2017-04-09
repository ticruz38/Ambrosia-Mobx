const Daemon = require("./Daemon.js");
import Daemon from './Daemon';
const Logger = require("logplease");
const logger = Logger.create("ipfs-daemon", {
    useColors: false,
    showTimestamp: false
});
Logger.setLogLevel("ERROR");

class IpfsDaemon extends Daemon {
    constructor(options) {
        // Initialize and start the daemon
        super(options);
        this._start();
    }

    _start() {
        return this._initDaemon()
            .then( () => this._daemon.on( 'ready', _ => this.emit('ready') ) )
            .catch(e => this.emit("error", e));
    }

    get GatewayAddress() {
        return "0.0.0.0:8080/ipfs/"; //this._daemon.gatewayAddr ? this._daemon.gatewayAddr + '/ipfs/' : null
    }

    get APIAddress() {
        return this._options.Addresses.Swarm; //(this.apiHost && this.apiPort) ? this.apiHost + ':' + this.apiPort : null
    }

    _initDaemon() {
        return new Promise((resolve, reject) => {
            const ipfsOptions = {
                repo: this._options.IpfsDataDir,
                EXPERIMENTAL: {
                    pubsub: true
                }
            };

            this._daemon = new Ipfs(ipfsOptions);
            console.log(this._daemon, this._daemon.isOnline());
            this._daemon.init({ emptyRepo: true, bits: 2048 }, err => {
                if (err && err.message !== "repo already exists")
                    return reject(err);

                this._daemon.config.get((err, config) => {
                    if (err) return reject(err);

                    if (this._options.SignalServer) {
                        const address = this._options.SignalServer.split(":");
                        const host = address[0] || "0.0.0.0";
                        const port = address[1] || 9090;
                        const signalServer = address.length > 1
                            ? // IP:port
                              `/libp2p-webrtc-star/ip4/${host}/tcp/${port}/ws/ipfs/${config.Identity.PeerID}`
                            : // Domain
                              `/libp2p-webrtc-star/dns4/${this._options.SignalServer}/wss/ipfs/${config.Identity.PeerID}`;

                        this._options.Addresses.Swarm = [signalServer];
                    }

                    this._options = Object.assign(config, this._options);

                    this._daemon.config.set("Bootstrap", this._options.Bootstrap, err => {
                        if (err) return reject(err);

                        this._daemon.config.set( "Discovery", this._options.Discovery, err => {
                            if (err) return reject(err);

                            this._daemon.config.set( "Addresses", this._options.Addresses, err => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    }

    // Handle shutdown gracefully
    _handleShutdown() {
        if (this._daemon && this._daemon.isOnline()) this._daemon.goOffline();

        super._handleShutdown();
    }
}

IpfsDaemon.Name = "js-ipfs-browser";
module.exports = IpfsDaemon;
