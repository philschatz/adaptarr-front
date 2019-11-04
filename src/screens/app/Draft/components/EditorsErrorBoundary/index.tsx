import * as React from 'react'
import * as Sentry from '@sentry/browser'
import { Localized } from 'fluent-react/compat'

import Button from 'src/components/ui/Button'

interface ErrorBoundaryState {
  error: null
  eventId?: string
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state: ErrorBoundaryState = {
    error: null,
    eventId: undefined,
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ error })
    Sentry.withScope(scope => {
      scope.setExtras(errorInfo)
      const eventId = Sentry.captureException(error)
      this.setState({ eventId })
    })
  }

  private moveToDashboard = () => {
    window.history.pushState(null, "", "/")
    this.setState({ error: null, eventId: undefined })
  }

  private showReportDialog = () => {
    Sentry.showReportDialog({ eventId: this.state.eventId })
  }

  render() {
    const hasReport = this.state.eventId ? 'true' : 'false'

    if (this.state.error) {
      return (
        <div className="error-message">
          <h1>
            <Localized id="error-boundary-title">
              Something went wrong
            </Localized>
          </h1>
          <Localized id="error-boundary-info-editors-error" p={<p/>} $hasReport={hasReport}>
            <div />
          </Localized>
          <div className="buttons">
            <Button clickHandler={this.moveToDashboard}>
              <Localized id="error-boundary-button-go-to-dashboard">
                Go to dashboard
              </Localized>
            </Button>
            <Button clickHandler={window.location.reload}>
              <Localized id="error-boundary-button-reload">
                Reload page
              </Localized>
            </Button>
            {
              hasReport ?
                <Button clickHandler={this.showReportDialog} >
                  <Localized id="error-boundary-button-fill-report">
                    Fill out a report
                  </Localized>
                </Button>
                : null
            }
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
