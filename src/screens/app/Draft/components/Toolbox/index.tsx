import * as React from 'react'
import { Localized } from 'fluent-react/compat'
import { Editor, Value } from 'slate'

import AdmonitionTools from '../AdmonitionTools'
import DocumentTools from '../DocumentTools'
import ExerciseTools from '../ExerciseTools'
import FigureTools from '../FigureTools'
import FormatTools from '../FormatTools'
import InsertTools from '../InsertTools'
import ListTools from '../ListTools'
import XrefTools from '../XrefTools'
import SaveButton from '../SaveButton'
import MergeButton from '../MergeButton'

import './index.css'

export type Props = {
  value: Value,
  editor: Editor,
}

export default function Toolbox({ editor, value }: Props) {
  const { selection } = value

  if (!selection.isSet) {
    return (
      <div className="toolbox">
        <Localized id="editor-toolbox-no-selection">
          No selection
        </Localized>
      </div>
    )
  }

  if (selection.start.key !== selection.end.key) {
    return (
      <div className="toolbox">
        <Localized id="editor-toolbox-mulit-selection">
          Selection across elements is not yet supported.
        </Localized>
      </div>
    )
  }

  return (
    <div className="toolbox" onMouseDown={ev => ev.preventDefault()}>
      <div className="toolbox__group">
        <SaveButton value={value} />
        <MergeButton value={value} />
      </div>
      <FormatTools editor={editor} value={value} />
      <InsertTools editor={editor} value={value} />

      <AdmonitionTools editor={editor} value={value} />
      <ExerciseTools editor={editor} value={value} />
      <FigureTools editor={editor} value={value} />
      <ListTools editor={editor} value={value} />
      <XrefTools editor={editor} value={value} />
      <DocumentTools editor={editor} value={value} />
    </div>
  )
}