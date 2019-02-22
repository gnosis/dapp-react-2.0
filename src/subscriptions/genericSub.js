import { shallowDifferent } from '../api/utils'

const StatefulSubBase = {
    getState() {
        return this._state
    },

    _getNewState() {
        return {}
    },

    subscribe(cb) {
        this._subscriptions.push(cb)

        return () => this.unsubscribe(cb)
    },

    unsubscribe(cb) {
        this._subscriptions = this._subscriptions.filter(sub => sub !== cb)
    },

    _shouldUpdate(prevState, nextState) {
        return shallowDifferent(prevState, nextState)
    },
    
    async update(...args) {
        const nextState = await this._getNewState(...args)

        if (this._shouldUpdate(this._state, nextState)) {
            this._state = nextState
            this._subscriptions.forEach((cb) => { cb(nextState) })
        }
    },
}

const createStatefulSub = (
    getNewState,
    initialState,
    mixin,
) => {
    // set proto as StatefulSubBase
    const statefulChildSub = Object.create(StatefulSubBase)

    return Object.assign(statefulChildSub, {
        _getNewState: getNewState,
        _state: initialState,
        _subscriptions: [],
    }, mixin)
}

export const createMultiSub = async (...subs) => {
    const getAllStates = subs.map(sub => sub.getState())

    const multiSub = createStatefulSub(getAllStates, getAllStates(), {
        _shouldUpdate: () => true,
    })

    const updateMultiSub = () => multiSub.update()

    subs.forEach((sub) => {
        sub.subscribe(updateMultiSub)
    })

    return multiSub
}

export default createStatefulSub
