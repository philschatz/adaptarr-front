import './index.css'

import * as React from 'react'
import { connect } from 'react-redux'
import { Trans } from 'react-i18next'
import { FilesError } from 'react-files'

import axios from 'src/config/axios'
import sortArrayByTitle from 'src/helpers/sortArrayByTitle'

import AdminUI from 'src/components/AdminUI'
import SuperSession from 'src/components/SuperSession'
import ModuleInfo from 'src/components/ModuleInfo'
import Dialog from 'src/components/ui/Dialog'
import Button from 'src/components/ui/Button'
import Icon from 'src/components/ui/Icon'
import Input from 'src/components/ui/Input'

import FilesUploader from 'src/containers/FilesUploader'

import * as modulesActions from 'src/store/actions/Modules'
import { ModulesMap, ModuleShortInfo, RequestInfoKind } from 'src/store/types'
import { State } from 'src/store/reducers'
import { addAlert } from 'src/store/actions/Alerts'

type Props = {
  modules: {
    modulesMap: ModulesMap
  }
  onModuleClick: (mod: ModuleShortInfo) => any
  addModuleToMap: (mod: ModuleShortInfo) => any
  removeModuleFromMap: (id: string) => any
  addAlert: (kind: RequestInfoKind, message: string) => void
}

const mapStateToProps = ({ modules }: State) => {
  return {
    modules,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    addModuleToMap: (mod: ModuleShortInfo) => dispatch(modulesActions.addModuleToMap(mod)),
    removeModuleFromMap: (id: string) => dispatch(modulesActions.removeModuleFromMap(id)),
    addAlert: (kind: RequestInfoKind, message: string) => dispatch(addAlert(kind, message)),
  }
}

class ModuleList extends React.Component<Props> {

  state: {
    moduleTitleValue: string
    showSuperSession: boolean
    moduleToDelete: ModuleShortInfo | null
    showRemoveModule: boolean
    files: File[]
    filterInput: string
  } = {
    moduleTitleValue: '',
    showSuperSession: false,
    moduleToDelete: null,
    showRemoveModule: false,
    files: [],
    filterInput: '',
  }

  private listOfModules = (modulesMap: ModulesMap) => {
    const filterReg = new RegExp('^' + this.state.filterInput, 'i')
    let modules: ModuleShortInfo[] = []

    modulesMap.forEach(mod => {
      if (this.state.filterInput) {
        if (filterReg.test(mod.title)) {
          modules.push(mod)
        }
      } else {
        modules.push(mod)
      }
    })

    modules.sort(sortArrayByTitle)

    return modules.map((mod: ModuleShortInfo) => {
      return (
        <li key={mod.id} className="modulesList__item">
          <span onClick={() => this.handleModuleClick(mod)}>
            <ModuleInfo mod={mod}/>
          </span>
          <Button color="red" clickHandler={() => this.showRemoveModuleDialog(mod)}>
            <Icon name="minus"/>
          </Button>
        </li>
      )
    })
  }

  private handleModuleClick = (mod: ModuleShortInfo) => {
    this.props.onModuleClick(mod)
  }

  private updateModuleTitleValue = (val: string) => {
    this.setState({ moduleTitleValue: val })
  }

  private addNewModule = () => {
    const { moduleTitleValue: title, files } = this.state

    if (files.length) {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } }

      let data = new FormData()
      data.append('title', title)
      data.append('file', files[0])

      axios.post('modules', data, config)
        .then(res => {
          this.props.onModuleClick(res.data)
          this.props.addModuleToMap(res.data)
          this.props.addAlert('success', `Module "${this.state.moduleTitleValue}" was added.`)
        })
        .catch(e => {
          if (e.request.status === 403) {
            this.setState({ showSuperSession: true })
            this.props.addAlert('info', 'You have to confirm this action.')
          } else {
            this.props.addAlert('error', e.message)
          }
        })
    } else {
      axios.post('modules', {title})
        .then(res => {
          this.props.onModuleClick(res.data)
          this.props.addModuleToMap(res.data)
          this.props.addAlert('success', `Module "${this.state.moduleTitleValue}" was added.`)
        })
        .catch(e => {
          if (e.request.status === 403) {
            this.setState({ showSuperSession: true })
            this.props.addAlert('info', 'You have to confirm this action.')
          } else {
            this.props.addAlert('error', e.message)
          }
        })
    }
  }

  private onFilesChange = (files: File[]) => {
    this.setState({ files })
  }

  private onFilesError = (error: FilesError, file: File) => {
    this.props.addAlert('error', error.message)
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
        this.props.addAlert('success', `${mod.title} was deleted successfully.`)
      })
      .catch(e => {
        if (e.request.status === 403) {
          this.setState({ showSuperSession: true })
          this.props.addAlert('info', 'You have to confirm this action.')
        } else {
          this.props.addAlert('error', e.message)
        }
      })
  }

  private handleFilterInput = (val: string) => {
    if (val !== this.state.filterInput) {
      this.setState({ filterInput: val})
    }
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
    this.props.addAlert('error', e.message)
  }

  public render() {
    const { moduleTitleValue, showSuperSession, showRemoveModule } = this.state
    const modulesMap = this.props.modules.modulesMap

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
                <Trans i18nKey="Buttons.delete"/>
              </Button>
              <Button color="red" clickHandler={this.closeRemoveModuleDialog}>
                <Trans i18nKey="Buttons.cancel"/>
              </Button>
            </Dialog>
          : null
        }
        <AdminUI>
          <div className="modulesList__new">
            <div className="modulesList__top-bar">
              <Input  
                placeholder="Title"
                value={moduleTitleValue}
                onChange={this.updateModuleTitleValue}
                validation={{minLength: 3}}
              />
              <Button 
                isDisabled={moduleTitleValue.length < 3}
                clickHandler={this.addNewModule}
              >
                <Icon name="plus"/>
                <Trans i18nKey="Buttons.addNew"/>
              </Button>
            </div>
            <FilesUploader
              onFilesChange={this.onFilesChange}
              onFilesError={this.onFilesError}
              accepts={['.zip', '.rar', '.cnxml']}
            />
          </div>
        </AdminUI>
        {
          modulesMap.size > 6 ?
            <div className="modulesList__filter">
              <Input
                onChange={this.handleFilterInput}
                placeholder="Search for module"
              />
            </div>
          : null
        }
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
