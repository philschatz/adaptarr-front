import * as React from 'react'
import * as PropTypes from 'prop-types'
import Select from 'react-select'
import { Editor, Value, Operation } from 'slate'
import { pick } from 'lodash'
import { Localized } from 'fluent-react/compat'

import { languages as LANGUAGES } from 'src/locale/data.json'

import store from 'src/store'
import { setCurrentDraftLang } from 'src/store/actions/Drafts'
import Storage from 'src/api/storage'

import ToolGroup from '../ToolGroup'
import CharactersCounter from '../CharactersCounter'

import { OnToggle } from '../ToolboxDocument'

export type Props = {
  editor: Editor,
  value: Value,
  toggleState: boolean,
  onToggle: OnToggle,
}

export default class DocumentTools extends React.Component<Props> {
  static contextTypes = {
    storage: PropTypes.instanceOf(Storage),
  }

  componentDidMount() {
    const { editor, value } = this.props

    const code = this.context.storage.language
    if (value.data.get('language') !== code) {

      const newProperties = Value.createProperties({ data: value.data.set('language', code) })
      const prevProperties = pick(value, Object.keys(newProperties))

      editor.applyOperation({
        type: 'set_value',
        properties: prevProperties,
        newProperties,
      } as unknown as Operation)
    }
  }

  render() {
    const { value } = this.props

    const code = value.data.get('language')
    const language = LANGUAGES.find(lang => lang.code === code)

    return (
      <ToolGroup
        title="editor-tools-document-title"
        toggleState={this.props.toggleState}
        onToggle={() => this.props.onToggle('documentTools')}
      >
        <label className="toolbox__label">
          <span className="toolbox__title">
            <Localized id="editor-tools-document-select-language">
              Select document language
            </Localized>
          </span>
          <Select
            className="toolbox__select react-select"
            value={language ? {value: language.code, label: language.name} : null}
            onChange={this.setLanguage}
            options={LANGUAGES.map(l => {return {value: l.code, label: l.name}})}
            getOptionLabel={getOptionLabel}
          />
        </label>
        <CharactersCounter value={value} />
      </ToolGroup>
    )
  }

  setLanguage = ({ value: code }: {value: string, label: string}) => {
    const { editor, value } = this.props

    const newProperties = Value.createProperties({ data: value.data.set('language', code) })
    const prevProperties = pick(value, Object.keys(newProperties))

    editor.applyOperation({
      type: 'set_value',
      properties: prevProperties,
      newProperties,
    } as unknown as Operation)

    this.context.storage.setLanguage(code)

    store.dispatch(setCurrentDraftLang(code))
  }
}

function getOptionLabel({ label: name }: {value: string, label: string}) {
  return name
}
