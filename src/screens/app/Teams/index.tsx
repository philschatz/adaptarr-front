import * as React from 'react'
import { connect } from 'react-redux'
import { Localized } from 'fluent-react/compat'
import { match } from 'react-router'
import { History } from 'history'

import { Team, User } from 'src/api'

import store from 'src/store'
import { setTeam, setTeams } from 'src/store/actions/app'
import { addAlert } from 'src/store/actions/alerts'
import { State } from 'src/store/reducers'
import { UsersMap, TeamsMap } from 'src/store/types'

import { useIsInSuperMode } from 'src/hooks'

import AddTeam from './components/AddTeam'
import RoleManager from './components/RoleManager'
import AddRole from './components/AddRole'
import MembersManager from './components/MembersManager'
import Header from 'src/components/Header'
import Section from 'src/components/Section'
import Spinner from 'src/components/Spinner'
import EditableText from 'src/components/EditableText'
import Button from 'src/components/ui/Button'
import Icon from 'src/components/ui/Icon'

import './index.css'

export type TeamsProps = {
  teams: TeamsMap
  user: User
  users: UsersMap
  match: match<{ id: string, tab: string }>
  history: History
}

const mapStateToProps = ({ app: { teams }, user: { user, users } }: State) => {
  return {
    teams,
    user,
    users,
  }
}

type Tab = 'roles' | 'members'

const Teams = (props: TeamsProps) => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)
  const [activeTab, setActiveTab] = React.useState<Tab>('roles')
  const isInSuperMode = useIsInSuperMode(props.user)

  const onTeamClick = (team: Team) => {
    if (selectedTeam && selectedTeam.id === team.id) {
      unselectTeam()
    } else {
      selectTeam(team.id)
    }
  }

  const unselectTeam = () => {
    setSelectedTeam(null)
  }

  const selectTeam = async (id: number, tab: Tab = 'roles') => {
    const team = props.teams.get(id)!
    if (
      !selectedTeam ||
      selectedTeam.id !== team.id ||
      activeTab !== tab
    ) {
      setSelectedTeam(team)
      setActiveTab(tab as Tab)
      props.history.push(`/teams/${id}/${tab}`)
    }
  }

  const updateTeamName = async (name: string, team: Team) => {
    await team.update({ name })
      .then((team) => {
        store.dispatch(addAlert('success', 'teams-update-name-success'))
        store.dispatch(setTeam(team))
      })
      .catch(() => {
        store.dispatch(addAlert('error', 'teams-update-name-error'))
      })
  }

  const activateRolesTab = () => {
    if (activeTab !== 'roles') {
      setActiveTab('roles')
      props.history.push(`/teams/${props.match.params.id}/roles`)
    }
  }

  const activateMembersTab = () => {
    if (activeTab !== 'members') {
      setActiveTab('members')
      props.history.push(`/teams/${props.match.params.id}/members`)
    }
  }

  const fetchRoles = () => {
    selectedTeam!.getRoles()
      .then(() => {
        // Force update of component
        setActiveTab(activeTab)
      })
  }

  const fetchTeams = async () => {
    setIsLoading(true)
    await Team.all()
      .then(teams => {
        store.dispatch(setTeams(teams))
        const { id, tab } = props.match.params
        if (id) {
          selectTeam(Number(id), tab as Tab)
          return
        }

        if (tab && tab === 'roles') {
          activateRolesTab()
        } else if (tab && tab === 'members') {
          activateMembersTab()
        }
      })
      .catch(() => {
        store.dispatch(addAlert('error', 'teams-error-fetch'))
      })
    setIsLoading(false)
    return true
  }

  React.useEffect(() => {
    const { id, tab } = props.match.params
    selectTeam(Number(id), tab as Tab)

    if (tab === 'roles') {
      activateRolesTab()
    } else if (tab === 'members') {
      activateMembersTab()
    }
  }, [props.match.params.id, props.match.params.tab])

  React.useEffect(() => {
    fetchTeams()
  }, [])

  const { teams } = props

  if (isLoading) return <Spinner />

  return (
    <div className={`container ${selectedTeam ? 'container--splitted' : ''}`}>
      <Section className="teams">
        <Header l10nId="teams-section-manage-teams-title" title="Manage teams">
          {
            selectedTeam ?
              <div className="tabs-controls">
                <Button
                  withBorder={true}
                  className={activeTab === 'roles' ? 'active' : ''}
                  clickHandler={activateRolesTab}>
                  <Localized id="teams-tab-roles">
                    Roles
                  </Localized>
                </Button>
                <Button
                  withBorder={true}
                  className={activeTab === 'members' ? 'active' : ''}
                  clickHandler={activateMembersTab}>
                  <Localized id="teams-tab-members">
                    Team members
                  </Localized>
                </Button>
              </div>
            : null
          }
        </Header>
        <div className="section__content">
          <AddTeam onSuccess={fetchTeams} />
          <ul className="teams__list">
            {
              Array.from(teams.values()).map(t => {
                const isActive = selectedTeam && t.id === selectedTeam.id
                return (
                  <li
                    key={t.id}
                    className={`teams__team ${isActive ? 'teams__team--selected' : ''}`}
                    onClick={() => onTeamClick(t)}
                  >
                    {
                      isInSuperMode ?
                        <EditableText
                          text={t.name}
                          onAccept={(name: string) => updateTeamName(name, t)}
                        />
                      : t.name
                    }
                  </li>
                )
              })
            }
          </ul>
        </div>
      </Section>
      {
        selectedTeam ?
          activeTab === 'roles' ?
            <Section className="teams">
              <Header
                l10nId="teams-section-manage-roles-title"
                $team={selectedTeam.name}
                title="Manage roles">
                <Button clickHandler={unselectTeam} className="close-button">
                  <Icon name="close" />
                </Button>
              </Header>
              <div className="section__content">
                <ul className="teams__rolesList">
                  {
                    selectedTeam.roles.map(r => (
                      <li key={r.id} className="teams__role">
                        <RoleManager role={r} onUpdate={fetchRoles} onDelete={fetchRoles} />
                      </li>
                    ))
                  }
                </ul>
                <AddRole team={selectedTeam} onSuccess={fetchRoles} />
              </div>
            </Section>
          :
            <Section className="teams">
              <Header
                l10nId="teams-section-manage-members-title"
                $team={selectedTeam.name}
                title="Manage members">
                <Button clickHandler={unselectTeam} className="close-button">
                  <Icon name="close" />
                </Button>
              </Header>
              <div className="section__content">
                <MembersManager team={selectedTeam} />
              </div>
            </Section>
        : null
      }
    </div>
  )
}

export default connect(mapStateToProps)(Teams)
