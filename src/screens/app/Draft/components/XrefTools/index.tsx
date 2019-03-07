import * as React from 'react'
import Select from 'react-select'
import { Localized } from 'fluent-react/compat'
import { Editor, Value } from 'slate'

import getCurrentLng from 'src/helpers/getCurrentLng'
import { Module } from 'src/api'
import { ReferenceTarget } from 'src/store/types'

import ToolGroup from '../ToolGroup'
import Modal from 'src/components/Modal'
import Button from 'src/components/ui/Button'
import Icon from 'src/components/ui/Icon'

import XrefTargetSelector from 'src/containers/XrefTargetSelector'

const CASES: string[] = ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'locative', 'vocative']

export type Props = {
  editor: Editor,
  value: Value,
}

export default class XrefTools extends React.Component<Props> {
  xrefModal: Modal | null = null

  public render() {
    const xref = this.getActiveXref()

    if (!xref) return null

    return (
      <ToolGroup title="editor-tools-xref-title">
        <label className="toolbox__label">
          <Localized id="editor-tools-xref-case">
            Select case
          </Localized>
          <Select
            className="toolbox__select"
            onChange={this.changeCase}
            options={CASES}
            value={xref.data.get('case') || CASES[0]}
            formatOptionLabel={OptionLabel}
          />
        </label>
        <Button clickHandler={this.openXrefModal} className="toolbox__button--insert">
          <Icon name="pencil" />
          <Localized id="editor-tools-xref-change">
            Change target
          </Localized>
        </Button>
        <Modal
          ref={this.setXrefModal}
          content={this.renderXrefModal}
        />
      </ToolGroup>
    )
  }

  private getActiveXref = () => {
    const xref = this.props.value.startInline

    if (!xref) return null

    return xref.type === 'xref' ? xref : null
  }

  private changeCase = (value: string) => {
    const xref = this.getActiveXref()
    if (!xref) return

    let newRef = {
      type: 'xref',
      data: {
        target: xref.data.get('target'),
        case: value !== 'none' ? value : null,
      }
    }

    if (xref.data.get('document')) {
      newRef.data['document'] = xref.data.get('document')
    }

    this.props.editor.setNodeByKey(xref.key, newRef)
  }

  private setXrefModal = (el: Modal | null) => el &&(this.xrefModal = el)

  private openXrefModal = () => this.xrefModal!.open()

  private renderXrefModal = () => (
    <XrefTargetSelector
      editor={this.props.editor}
      onSelect={this.changeReference}
    />
  )

  private changeReference = (target: ReferenceTarget, source: Module | null) => {
    this.xrefModal!.close()
    const newRef = {type: 'xref', data: { target: target.id, document: source ? source.id : undefined }}
    const xref = this.getActiveXref()
    if (!xref) return
    this.props.editor.setNodeByKey(xref.key, newRef)
  }
}

function OptionLabel(case_: string) {
  return <Localized id="editor-tools-xref-grammatical-case" $case={case_} />
}