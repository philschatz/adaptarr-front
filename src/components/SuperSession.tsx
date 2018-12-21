import * as React from 'react'
import axiosClean from 'axios'
import { Trans } from 'react-i18next'


import Dialog from './ui/Dialog'
import Button from './ui/Button'
import Input from './ui/Input'

type Props = {
  onSuccess: (response: any) => any
  onFailure: (error: Error) => any
  onAbort: () => any
}

 class SuperSession extends React.Component<Props> {

  state: {
    errorMessage: string
    passwordInput: string
  } = {
    errorMessage: '',
    passwordInput: '',
  }

  private confirmSuperSession = () => {
    const password = this.state.passwordInput

    if (password) {
      return new Promise((resolve, reject) => {
        axiosClean.post('/elevate', `password=${password}`)
          .then(res => {
            this.setState({ errorMessage: '' })
            resolve(this.props.onSuccess(res))
          })
          .catch(e => {
            this.setState({ errorMessage: e.message })
            reject(this.props.onFailure(e))
          })
      })
    }

    const errorMessage = 'You have to provide password.'
    this.setState({ errorMessage })

    return this.props.onFailure(new Error(errorMessage))
  }

  public render() {
    const { errorMessage } = this.state

    return (
      <Dialog 
        onClose={this.props.onAbort} 
        i18nKey="Admin.confirmSuperSession"
        className="supersession"
      >
        <form>
          {
            errorMessage ?
              <span className="error">{errorMessage}</span>
            : null
          }
          <Input 
            type="password" 
            onChange={(val) => this.setState({ passwordInput: val })} 
            placeholder="Password"
            autoFocus
          />
          <Button clickHandler={this.confirmSuperSession}>
            <Trans i18nKey="Buttons.confirm" />
          </Button>
        </form>
      </Dialog>
    )
  }
}

export default SuperSession
