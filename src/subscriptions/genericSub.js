import { shallowDifferent } from "../api/utils"

const StatefulSubBase = {
  _updateCounter: 0,
  _latestFinishedIdx: 0,

  getState() {
    return this._state
  },

  _getNewState() {
    return this._state
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
    const currentUpdateIdx = ++this._updateCounter
    // const cachedState = this._state
    // this._state = this._defaultState
    const nextState = await this._getNewState(...args)

    // ensures that
    // if we have update1 started(idx 1) and then update2(idx 2) started

    // if update1 finishes first we update state (latest idx = 1)
    // and then update when update2 finishes; (idx 2 > latest idx)

    // if update2 finishes first we update state (latest idx = 1)
    // and when the late update1 finishes
    // we don't update with stale data (idx 1 < latest idx)
    if (currentUpdateIdx <= this._latestFinishedIdx) return
    this._latestFinishedIdx = currentUpdateIdx

    if (this._shouldUpdate(this._state, nextState)) {
      this._state = nextState
      this._subscriptions.forEach((cb) => {
        cb(nextState)
      })
    } /* else {
            this._state = cachedState
        } */
  },
}

const createStatefulSub = (getNewState, initialState, mixin) => {
  // set proto as StatefulSubBase
  const statefulChildSub = Object.create(StatefulSubBase)

  return Object.assign(
    statefulChildSub,
    {
      _getNewState: getNewState,
      _state: initialState,
      _subscriptions: [],
    },
    mixin,
  )
}

export const createMultiSub = (...subs) => {
//   const getAllStates = () => subs.map(sub => sub.getState())

  const getNewState = () => Promise.all(subs.map(sub => sub._getNewState()))
  const initialState = subs.map(sub => sub.getState())
  const multiSub = createStatefulSub(getNewState, initialState, {
    // const multiSub = createStatefulSub(getAllStates, getAllStates(), {
    _shouldUpdate: () => true,
  })

  const updateMultiSub = () => multiSub.update()

  subs.forEach((sub) => {
    sub.subscribe(updateMultiSub)
  })

  return multiSub
}

export default createStatefulSub
