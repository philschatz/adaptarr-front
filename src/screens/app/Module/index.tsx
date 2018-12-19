import * as React from 'react'

import axios from 'src/config/axios'
import store from 'src/store'
import { addAlert } from 'src/store/actions/Alerts'

import Section from 'src/components/Section'
import Header from 'src/components/Header'
import Spinner from 'src/components/Spinner'

import { ModuleShortInfo } from 'src/store/types'
import ModulePreview from 'src/containers/ModulePreview';

type Props = {
  match: {
    params: {
      id: string
    }
  }
}

class Module extends React.Component<Props> {
  
  state: {
    isLoading: boolean
    mod: ModuleShortInfo | undefined
    error?: string
  } = {
    isLoading: true,
    mod: undefined,
  }

  private fetchModuleInfo = () => {
    axios.get(`modules/${this.props.match.params.id}`)
      .then(res => {
        this.setState({ mod: res.data, error: '' })
      })
      .catch(e => {
        this.setState({ error: e.message })
        store.dispatch(addAlert('error', e.message))
      })
  }

  componentDidMount = () => {
    this.fetchModuleInfo()
  }

  public render() {
    const { mod } = this.state

    return (
      <Section>
        <Header title={mod ? mod.title : 'Unknow module'}/>
        <div className="section__content">
          {
            mod ?
              <ModulePreview moduleId={mod.id}/>
            : <Spinner/>
          }
        </div>
      </Section>
    )
  }
}

export default Module
