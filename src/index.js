import App from 'components/App'
import { AppContainer } from 'react-hot-loader'
import 'styles/bootstrap.scss'

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('components/App', () => {
    render(App)
  })
}
