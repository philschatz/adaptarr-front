import * as React from 'react'
import { Localized } from 'fluent-react/compat'

import Team from 'src/api/team'
import { ProcessStructure } from 'src/api/process'

import Slot from './Slot'
import Step from './Step'

import './index.css'

export type ProcessPreviewProps = {
  structure: ProcessStructure
  team: Team
}

class ProcessPreview extends React.Component<ProcessPreviewProps> {
  public render() {
    const { structure, team } = this.props
    const roles = team.roles

    return (
      <div className="process-preview">
        <h2>
          <Localized id="process-preview-title" $name={structure.name}>
            Process name:
          </Localized>
        </h2>
        <div className="process-preview__slots">
          <h3>
            <Localized id="process-preview-slots-list">
              List of slots:
            </Localized>
          </h3>
          <ul>
            {
              structure.slots.map(s => {
                return <li key={s.id}><Slot slot={s} roles={roles} /></li>
              })
            }
          </ul>
        </div>
        <div className="process-preview__steps">
          <h3>
            <Localized id="process-preview-steps-list">
              List of steps:
            </Localized>
          </h3>
          <ul>
            {
              structure.steps.map(s => {
                return (
                  <li key={s.id}>
                    <Step
                      step={s}
                      slots={structure.slots}
                      steps={structure.steps}
                    />
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}

export default ProcessPreview
