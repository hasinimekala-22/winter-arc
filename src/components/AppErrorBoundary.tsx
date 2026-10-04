import {
  Component
} from 'react'

import type {
  ErrorInfo,
  ReactNode
} from 'react'


type Props = {
  children: ReactNode
}


type State = {
  hasError: boolean
}


class AppErrorBoundary
  extends Component<Props, State> {

  state: State = {
    hasError: false
  }


  static getDerivedStateFromError():
    State {

    return {
      hasError: true
    }

  }


  componentDidCatch(
    error: Error,
    info: ErrorInfo
  ) {

    console.error(
      'Winter ARC application error:',
      error,
      info
    )

  }


  handleReload = () => {

    window.location.reload()

  }


  render() {

    if (
      this.state.hasError
    ) {

      return (

        <div className="app-error">

          <div className="app-error-card">

            <span>
              ⚠️
            </span>

            <h1>
              Winter ARC encountered an error
            </h1>

            <p>
              Your saved data has not been intentionally deleted.
              Try reloading the application.
            </p>

            <button
              type="button"
              onClick={
                this.handleReload
              }
            >
              Reload Winter ARC
            </button>

          </div>

        </div>

      )

    }


    return this.props.children

  }

}


export default AppErrorBoundary