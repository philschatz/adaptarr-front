import * as React from 'react'
import { Localized } from 'fluent-react/compat'

import { StepSlot, ProcessSlot } from 'src/api/process'

import './index.css'

type Props = {
  slots: ProcessSlot[]
  slot: StepSlot
}

class StepSlot_ extends React.Component<Props> {
  public render() {
    const { slot, slots } = this.props

    return (
      <div className="process-preview-step-slot">
        <span>
          <Localized
            id="process-preview-step-slot"
            $name={slots[slot.slot].name}
            $permission={slot.permission}
          >
            {`${slots[slot.slot].name} is able to ${slot.permission}`}
          </Localized>
        </span>
      </div>
    )
  }
}

export default StepSlot_