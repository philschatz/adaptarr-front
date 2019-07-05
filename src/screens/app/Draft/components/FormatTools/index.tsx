import * as React from 'react'
import { Editor, Value, Text, Document, Block, Inline } from 'slate'
import { List } from 'immutable'

import Button from 'src/components/ui/Button'
import Icon from 'src/components/ui/Icon'
import Tooltip from 'src/components/ui/Tooltip'

export type Props = {
  editor: Editor,
  value: Value,
  selectionParent: Document | Block | Inline | null,
}

type Format = 'strong' | 'emphasis' | 'underline' | 'superscript' | 'subscript' | 'code' | 'term'

const FORMATS: Format[] = ['strong', 'emphasis', 'underline', 'superscript', 'subscript', 'code', 'term']

const VALID_LIST_PARENTS = ['admonition', 'document', 'exercise_problem', 'exercise_solution', 'section']

export default class FormatTools extends React.Component<Props> {
  render() {
    const { editor, value } = this.props
    const { startBlock } = value
    const code = startBlock && startBlock.type === 'code' ? startBlock : null

    if (!startBlock || editor.isVoid(startBlock) || code) {
      return null
    }

    return (
      <div className="toolbox-format">
        {FORMATS.map(format => (
          <Tooltip
            l10nId={`editor-tools-format-button-${format}`}
            direction="up"
            className="toolbox__button--with-tooltip"
            key={format}
          >
            <Button
              className={`toolbox__button--only-icon ${this.isActive(format) ? 'active' : ''}`}
              dataId={format}
              clickHandler={this.applyFormat}
            >
              <Icon size="small" name={format} />
            </Button>
          </Tooltip>
        ))}
        <Tooltip
          l10nId={'editor-tools-format-button-list'}
          direction="up"
          className="toolbox__button--with-tooltip"
        >
          <Button
            className="toolbox__button--only-icon"
            isDisabled={!this.validateParents(VALID_LIST_PARENTS)}
            clickHandler={this.formatList}
          >
            <Icon size="small" name="list-ul" />
          </Button>
        </Tooltip>
        <Tooltip
          l10nId={'editor-tools-format-button-clear'}
          direction="up"
          className="toolbox__button--with-tooltip"
        >
          <Button
            className="toolbox__button--only-icon"
            isDisabled={value.activeMarks.isEmpty()}
            clickHandler={this.clear}
          >
            <Icon size="small" name="close" />
          </Button>
        </Tooltip>
      </div>
    )
  }

  private isActive = (format: Format) => {
    const isMark = this.props.value.marks.some(mark => mark ? mark.type === format : false)
    const inline = this.props.value.startInline
    const isInline = inline && inline.type === format ? true : false
    return isMark || isInline
  }

  private applyFormat = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault()

    const format = (ev.currentTarget as HTMLButtonElement).dataset.id
    if (!format) return

    if (format === 'code') {
      const inline = this.props.value.startInline
      if (!inline || inline.type !== 'code') {
        if (this.props.value.selection.isCollapsed) {
          this.props.editor.insertInline({ type: 'code', nodes: List([Text.create(' ')]) })
          this.props.editor.moveBackward()
        } else {
          this.props.editor.wrapInline({ type: 'code' })
        }
      } else {
        this.props.editor.unwrapInlineByKey(inline.key, { type: 'code' })
      }
    } else if (format === 'term') {
      const inline = this.props.value.startInline
      if (!inline || inline.type !== 'term') {
        this.props.editor.wrapInline({ type: 'term' })
      } else {
        this.props.editor.unwrapInlineByKey(inline.key, { type: 'term', data: inline.data.toJS() })
      }
      return
    }

    this.props.editor.toggleMark(format)
  }

  private clear = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault()
    this.props.editor.removeMarks()
  }

  private formatList = () => {
    this.props.editor.wrapInList('ul_list')
  }

  private validateParents = (validParents: string[]): boolean => {
    const sp = this.props.selectionParent
    if (!sp) return false
    if (validParents.includes(sp.type) || validParents.includes(sp.object)) return true
    return false
  }
}
