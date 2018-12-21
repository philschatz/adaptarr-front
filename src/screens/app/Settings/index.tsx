import * as React from 'react'
import * as i18n from 'i18next'
import Select from 'react-select'
import { Trans } from 'react-i18next'

import axios from 'src/config/axios'

import Header from 'src/components/Header'
import Button from 'src/components/ui/Button'
import Dialog from 'src/components/ui/Dialog'
import Input from 'src/components/ui/Input'

type LanguageOption = {
  value: string
  label: string
}

const languages: LanguageOption[] = [
  { value: 'en-US', label: 'English' },
  { value: 'pl-PL', label: 'Polski' },
]

class Settings extends React.Component {
  state: {
    selectedLanguage: LanguageOption | null
    newSelectedLanguage: LanguageOption | null
    showChangeLanguage: boolean
    showChangePassword: boolean
    arePasswordsValid: boolean
    oldPassword: string
    newPassword: string
    newPassword2: string
  } = {
    selectedLanguage: null,
    newSelectedLanguage: null,
    showChangeLanguage: false,
    showChangePassword: false,
    arePasswordsValid: false,
    oldPassword: '',
    newPassword: '',
    newPassword2: '',
  }

  private handleLanguageChange = (selectedLanguage: LanguageOption) => {
    if (selectedLanguage === this.state.selectedLanguage) return

    this.setState({ showChangeLanguage: true, newSelectedLanguage: selectedLanguage })
  }

  private changeLanguage = () => {
    const newSelectedLanguage = this.state.newSelectedLanguage

    if (!newSelectedLanguage) return

    i18n.changeLanguage(newSelectedLanguage.value)

    location.reload()
  }

  private showChangePasswordDialog = () => {
    this.setState({ showChangePassword: true })
  }

  private validatePasswords = () => {
    const { oldPassword, newPassword, newPassword2 } = this.state

    if (oldPassword.length > 3 && newPassword.length > 3 && newPassword === newPassword2) {
      return this.setState({ arePasswordsValid: true })
    }

    return this.setState({ arePasswordsValid: false })
  }

  private updateOldPassword = (val: string) => {
    this.setState({ oldPassword: val }, this.validatePasswords)
  }

  private updateNewPassword = (val: string) => {
    this.setState({ newPassword: val }, this.validatePasswords)
  }

  private updateNewPassword2 = (val: string) => {
    this.setState({ newPassword2: val }, this.validatePasswords)
  }

  private changePassword = () => {
    /* axios.put('users/me')
      .then(() => {
        this.setState({
          showChangePassword: false,
          oldPassword: '',
          newPassword: '',
          newPassword2: '',
        })
      })
      .catch(e => {
        console.error(e.message)
        this.setState({ showChangePassword: false })
      }) */
  }

  componentDidMount = () => {
    const currentLang = localStorage.i18nextLng

    if (currentLang) {
      let selectedLanguage
      
      languages.some(lang => {
        if (lang.value === currentLang) {
          selectedLanguage = lang
          return true
        }
        return false
      })


      if (selectedLanguage) {
        this.setState({ selectedLanguage })
      }
    }
  }

  public render() {
    const { 
      selectedLanguage, 
      arePasswordsValid, 
      showChangeLanguage, 
      showChangePassword,
      oldPassword,
      newPassword,
      newPassword2,
    } = this.state

    return (
      <section className="section--wrapper">
        {
          showChangeLanguage ?
            <Dialog 
              i18nKey="Settings.changeLanguageDialog"
              onClose={() => this.setState({ showChangeLanguage: false })}
            >
              <Button 
                color="green"
                clickHandler={this.changeLanguage}
              >
                <Trans i18nKey="Buttons.confirm" />
              </Button>
              <Button 
                color="red"
                clickHandler={() => this.setState({ showChangeLanguage: false })}
              >
                <Trans i18nKey="Buttons.cancel" />
              </Button>
            </Dialog>
          : null
        }
        {
          showChangePassword ?
            <Dialog 
              i18nKey="Settings.changePasswordDialog"
              onClose={() => this.setState({ showChangePassword: false })}
            >
              <Button 
                color="green" 
                clickHandler={this.changePassword}
              >
                <Trans i18nKey="Buttons.confirm" />
              </Button>
              <Button 
                color="red" 
                clickHandler={() => this.setState({ showChangePassword: false })}
              >
                <Trans i18nKey="Buttons.cancel" />
              </Button>
            </Dialog>
          : null
        }
        <Header i18nKey="Settings.title" />
        <div className="section__content">
          <div className="settings">
            <h2 className="settings__title">
              <Trans i18nKey="Settings.changeLanguage" />
            </h2>
            <Select
              value={selectedLanguage}
              onChange={this.handleLanguageChange}
              options={languages}
              className="settings__select"
            />
            <h2 className="settings__title">
              <Trans i18nKey="Settings.changePassword" />
            </h2>
            <Input
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={this.updateOldPassword}
              validation={{minLength: 6, maxLength: 12}}
              errorMessage="Password must be bewtween 6 and 12 characters."
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={this.updateNewPassword}
              validation={{minLength: 6, maxLength: 12}}
              errorMessage="Password must be bewtween 6 and 12 characters."
            />
            <Input
              type="password"
              placeholder="Repeat new password"
              value={newPassword2}
              onChange={this.updateNewPassword2}
              validation={{sameAs: newPassword}}
              errorMessage="Password must be identical."
            />
            <Button
              isDisabled={!arePasswordsValid}
              clickHandler={this.showChangePasswordDialog}
            >
              <Trans i18nKey="Buttons.confirm" />
            </Button>
          </div>
        </div>
      </section>
    )
  }
}

export default Settings
