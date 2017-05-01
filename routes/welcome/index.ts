module.exports = {
    path: 'welcome',

    getComponent(nextState, cb) {
        System.import('./Welcome').then( module =>
            cb(null, module.default)
        ).catch(err => console.error(err));
    }
}