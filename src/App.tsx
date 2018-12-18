import * as React from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import Navigation from 'src/components/Navigation'
import Spinner from 'src/components/Spinner'
import Icon from 'src/components/ui/Icon'

import Dashboard from 'src/screens/app/Dashboard'
import NotificationsCentre from 'src/screens/app/NotificationsCentre'
import Books from 'src/screens/app/Books'
import Book from 'src/screens/app/Book'
import Resources from 'src/screens/app/Resources'
import Settings from 'src/screens/app/Settings'
import Invitations from 'src/screens/app/Invitations'
import Error404 from 'src/screens/app/Error404'

import * as userActions from 'src/store/actions/User'
import * as teamActions from 'src/store/actions/Team'
import * as notificationsActions from 'src/store/actions/Notifications'
import * as booksActions from 'src/store/actions/Books'
import * as modulesActions from 'src/store/actions/Modules'
import * as alertsActions from 'src/store/actions/Alerts'
import * as types from 'src/store/types'
import { State } from 'src/store/reducers/index'

import 'src/assets/styles/shared.css'

type Props = {
  user: {
    isLoading: types.IsLoading
    user: types.User
  }
  team: {
    teamMap: types.TeamMap
  }
  notifications: {}
  booksMap: {
    booksMap: types.BooksMap
  }
  modules: {
    modulesMap: types.ModulesMap
  }
  alerts: {
    alerts: types.Alert[]
  }
  fetchUser: () => void
  fetchTeamMap: () => void
  fetchNotifications: () => void
  fetchBooksMap: () => void
  fetchModulesMap: () => void
  removeAlert: (alert: types.Alert) => void
}

export const mapStateToProps = ({ user, notifications, team, booksMap, modules, alerts }: State) => {
  return {
    user,
    team,
    notifications,
    booksMap,
    modules,
    alerts,
  }
}

export const mapDispatchToProps = (dispatch: userActions.FetchUser | notificationsActions.FetchNotifications | booksActions.FetchBooksMap | modulesActions.FetchModulesMap | alertsActions.AddAlert) => {
  return {
    fetchUser: () => dispatch(userActions.fetchUser()),
    fetchTeamMap: () => dispatch(teamActions.fetchTeamMap()),
    fetchNotifications: () => dispatch(notificationsActions.fetchNotifications()),
    fetchBooksMap: () => dispatch(booksActions.fetchBooksMap()),
    fetchModulesMap: () => dispatch(modulesActions.fetchModulesMap()),
    removeAlert: (alert: types.Alert) => dispatch(alertsActions.removeAlert(alert))
  }
}

class App extends React.Component<Props> {

  componentDidMount () {
    this.props.fetchUser()
    this.props.fetchTeamMap()
    this.props.fetchNotifications()
    this.props.fetchBooksMap()
    this.props.fetchModulesMap()
  }

  public render() {
    const { isLoading, user } = this.props.user
    const { alerts } = this.props.alerts

    return (
      <Router>
        {
          !isLoading && user.id ?
            <div className="container container--main">
              <Navigation />
              <main>
                <Route exact path="/" component={Dashboard} />
                <Route path="/notifications" component={NotificationsCentre} />
                <Route exact path="/books" component={Books} />
                <Route path="/books/:id" component={Book} />
                <Route path="/resources" component={Resources} />
                <Route path="/settings" component={Settings} />
                <Route path="/invitations" component={Invitations} />
                <Route path='/404' component={Error404} />
                {/*<Redirect to="/404" />*/}
              </main>
              <div className="alerts">
                {
                  alerts.length > 0 ?
                    <ul className="alerts__list">
                      {
                        alerts.map((alert: types.Alert) => {
                          return (
                            <li key={alert.id} className={`alerts__alert alert--${alert.kind}`}>
                              <span className="alerts__close" onClick={() => this.props.removeAlert(alert)}>
                                <Icon name="close"/>
                              </span>
                              {alert.message}
                            </li>
                          )
                        })
                      }
                    </ul>
                  : null
                }
              </div>
            </div>
          : <Spinner />
        }
      </Router>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
