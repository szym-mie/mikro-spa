class Observable {
    /**
     * @constructor
     * @param {any} [parent] subject of observable, or this if omitted
     */
    constructor (parent) {
        this.parent = parent || this
        this.observerSet = new Set()
    }

    /**
     * Add an observer.
     * @param {Observer} observer observer to add
     */
    registerObserver (observer) {
        this.observerSet.add(observer)
    }

    /**
     * Remove an observer.
     * @param {Observer} observer observer to remove
     */
    unregisterObserver (observer) {
        this.observerSet.delete(observer)
    }

    /**
     * Send updates to the observer.
     * @param {string} action
     */
    notifyObservers (action) {
        const observers = [...this.observerSet.keys()]
        observers.forEach(observer => observer.onNotify(this.parent, action))
    }
}

export default Observable
