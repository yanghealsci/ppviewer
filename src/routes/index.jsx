import {browserHistory, Router, Route, IndexRedirect} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'
import store from 'store'

const history = syncHistoryWithStore(browserHistory, store)

export default class Routes extends React.Component {
  render () {
    return (
      <Router history={history}>
        <Route path={'/'}>
          <IndexRedirect to='content' />
          <Route path='content' getComponents={(nextState, cb) => {
            import(/* webpackChunkName: "content" */ 'apps/Content')
              .then(module => cb(null, module.default))
              .catch(e => console.error(e))
          }} />
          <Route path='school-zone' getComponents={(nextState, cb) => {
            import(/* webpackChunkName: "singleview" */ 'apps/PPViewer/SingleViewer')
              .then(module => cb(null, module.default))
              .catch(e => console.error(e))
          }} />
          <Route path='ppviewer' getComponents={(nextState, cb) => {
            import(/* webpackChunkName: "singleview" */ 'apps/PPViewer')
              .then(module => cb(null, module.default))
              .catch(e => console.error(e))
          }} />
        </Route>
      </Router>
    )
  }
}
