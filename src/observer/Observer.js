class Observer {
    /**
     * @callback onNotify
     * @param {any} sender object that sent an update
     * @param {string} action action of the update
     */

    /**
     * @constructor
     * @param {onNotify} [onNotify] do on update
     */
    constructor (onNotify) {
        this.onNotify = onNotify
    }
}

export default Observer
