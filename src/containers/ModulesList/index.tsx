import * as React from 'react'
import { connect } from 'react-redux'
import { Trans } from 'react-i18next'

import axios from 'src/config/axios'

import Dialog from 'src/components/ui/Dialog'
import Button from 'src/components/ui/Button'
import ModuleInfo from 'src/components/ModuleInfo'
import Icon from 'src/components/ui/Icon'

import { ModulesMap, ModuleShortInfo } from 'src/store/types'
import { State } from 'src/store/reducers'
import AdminUI from 'src/components/AdminUI'
import SuperSession from 'src/components/SuperSession'

import * as modulesActions from 'src/store/actions/Modules'

type Props = {
  modulesMap: {
    modulesMap: ModulesMap
  }
  onModuleClick: (mod: ModuleShortInfo) => any
  addModuleToMap: (mod: ModuleShortInfo) => any
  removeModuleFromMap: (id: string) => any
}

const mapStateToProps = ({ modulesMap }: State) => {
  return {
    modulesMap,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    addModuleToMap: (mod: ModuleShortInfo) => dispatch(modulesActions.addModuleToMap(mod)),
    removeModuleFromMap: (id: string) => dispatch(modulesActions.removeModuleFromMap(id)),
  }
}

class ModuleList extends React.Component<Props> {

  state: {
    moduleTitleValue: string
    showSuperSession: boolean
    moduleToDelete: ModuleShortInfo | null
    showRemoveModule: boolean
  } = {
    moduleTitleValue: '',
    showSuperSession: false,
    moduleToDelete: null,
    showRemoveModule: false,
  }

  private listOfModules = (modulesMap: ModulesMap) => {
    let modules: ModuleShortInfo[] = []

    modulesMap.forEach(mod => {
      modules.push(mod)
    })

    return modules.map((mod: ModuleShortInfo) => {
      return (
        <li key={mod.id} className="modulesList__item">
          <span onClick={() => this.handleModuleClick(mod)}>
            <ModuleInfo mod={mod} />
          </span>
          <Button color="red" clickHandler={() => this.showRemoveModuleDialog(mod)}>
            <Icon name="minus" />
          </Button>
        </li>
      )
    })
  }

  private handleModuleClick = (mod: ModuleShortInfo) => {
    this.props.onModuleClick(mod)
  }

  private updateModuleTitleValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ moduleTitleValue: e.target.value })
  }

  private addNewModule = () => {
    axios.post('modules', {title: this.state.moduleTitleValue})
      .then(res => {
        this.props.onModuleClick(res.data)
        this.props.addModuleToMap(res.data)
      })
      .catch(e => {
        if (e.request.status === 403) {
          this.setState({ showSuperSession: true })
        } else {
          console.error(e.message)
        }
      })
  }

  private showRemoveModuleDialog = (mod: ModuleShortInfo) => {
    this.setState({ showRemoveModule: true, moduleToDelete: mod })
  }

  private closeRemoveModuleDialog = () => {
    this.setState({ showRemoveModule: false, moduleToDelete: null })
  }

  private removeModule = () => {
    const mod = this.state.moduleToDelete

    if (!mod) return

    axios.delete(`/modules/${mod.id}`)
      .then(() => {
        this.props.removeModuleFromMap(mod.id)
      })
      .catch(e => {
        if (e.request.status === 403) {
          this.setState({ showSuperSession: true })
        } else {
          console.error(e.message)
        }
      })
  }

  private superSessionSuccess = () => {
    if (this.state.moduleToDelete && this.state.showRemoveModule) {
      this.removeModule()
    } else if (this.state.moduleTitleValue.length > 0) {
      this.addNewModule()
    }

    this.setState({ showSuperSession: false })
  }

  private superSessionFailure = (e: Error) => {
    console.log('failure', e.message)
  }

  public render() {
    const { moduleTitleValue, showSuperSession, showRemoveModule } = this.state
    const modulesMap = this.props.modulesMap.modulesMap

    return (
      <div className="modulesList">
        {
          showSuperSession ?
            <SuperSession
              onSuccess={this.superSessionSuccess} 
              onFailure={this.superSessionFailure}
              onAbort={() => this.setState({ showSuperSession: false })}/>
          : null
        }
        {
          showRemoveModule ?
            <Dialog
              i18nKey="ModulesList.deleteModuleDialog"
              onClose={this.closeRemoveModuleDialog}
            >
              <Button color="green" clickHandler={this.removeModule}>
                <Trans i18nKey="Buttons.delete" />
              </Button>
              <Button color="red" clickHandler={this.closeRemoveModuleDialog}>
                <Trans i18nKey="Buttons.cancel" />
              </Button>
            </Dialog>
          : null
        }
        <AdminUI>
          <div className="modulesList__new">
            <input 
              type="text" 
              placeholder="Title"
              value={moduleTitleValue}
              onChange={(e) => this.updateModuleTitleValue(e)} />
            <Button 
              isDisabled={moduleTitleValue.length === 0}
              clickHandler={this.addNewModule}
            >
              <Icon name="plus" />
              <Trans i18nKey="Buttons.addNew" />
            </Button>
          </div>
        </AdminUI>
        {
          modulesMap.size > 0 ?
            <ul className="modulesList__list">
              {this.listOfModules(modulesMap)}
            </ul>
          : null
        }
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModuleList)