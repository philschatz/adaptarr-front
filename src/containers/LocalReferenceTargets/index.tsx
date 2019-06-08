import * as React from 'react'
import { Block, Document, Editor, Node } from 'slate'
import { connect } from 'react-redux'

import * as api from 'src/api'
import { ReferenceTarget, ReferenceTargetType } from 'src/store/types'
import { State } from 'src/store/reducers'

import LocalizationLoader from 'src/screens/app/Draft/components/LocalizationLoader'

import ReferenceTargets from 'src/containers/ReferenceTargets'

/**
 * Mapping from Slate block types to reference target types, where they differ.
 */
const TYPE_MAP: { [key: string]: ReferenceTargetType } = {
  exercise_commentary: 'commentary',
  exercise_solution: 'solution',
  subfigure: 'figure',
}

export type Props = {
  /**
   * Editor session for the document for which to display reference targets.
   */
  editor: Editor,
  /**
   * Function to call when user selects a reference target.
   */
  onSelect: (target: ReferenceTarget, source: api.Module | null) => void,
  currentDraftLang: string,
}

const mapStateToProps = ({ draft: { currentDraftLang } }: State) => ({
  currentDraftLang,
})

/**
 * Display list of reference targets in an editor session.
 */
class LocalResourceTargets extends React.PureComponent<Props> {
  state: {
    countersMap: Map<string, Map<string, number>>
  } = {
    countersMap: new Map(),
  }

  private setCounters = () => {
    const { countersMap } = this.state
    const counters: Map<string, number> = new Map() // Map<type, counter>

    const setCounterForElement = (e: Element, customCounter?: number) => {
      const type = e.tagName.toLowerCase() === 'figure' ? 'figure' : e.className.replace(/-/g, '_')
      const key = e.getAttribute('data-key') || ''

      if (typeof customCounter !== 'number') {
        if (counters.has(type)) {
          counters.set(type, counters.get(type)! + 1)
        } else {
          counters.set(type, 1)
        }
      }

      const counter = customCounter || counters.get(type)!

      if (countersMap.has(key)) {
        if (countersMap.get(key)!.has(type)) {
          let newMap = countersMap.get(key)!
          newMap.set(type, counter)
          countersMap.set(key, newMap)
        } else {
          let newMap = countersMap.get(key)!
          newMap.set(type, counter)
          countersMap.set(key, newMap)
        }
      } else {
        let newMap = new Map([[type, counter]])
        countersMap.set(key, newMap)
      }
    }

    const editor = document.getElementsByClassName('editor--document')[0]
    const elements = editor.querySelectorAll('.admonition, figure, .exercise, .example')
    elements.forEach(e => {
      setCounterForElement(e)
      if (e.className === 'exercise') {
        const solutions = e.querySelectorAll('.exercise-solution')
        solutions.forEach((sol, i) => {
          setCounterForElement(sol, i + 1)
        })
        const commentaries = e.querySelectorAll('.exercise-commentary')
        commentaries.forEach((com, i) => {
          setCounterForElement(com, i + 1)
        })
      }
    })

    this.setState({ countersMap })
  }

  componentWillMount() {
    this.setCounters()
  }

  render() {
    const { editor, onSelect, currentDraftLang } = this.props
    const targets = Array.from(this.mapBlockToTargets(editor.value.document))

    return (
      targets.length ?
        <LocalizationLoader
          locale={currentDraftLang || 'en'}
        >
          <ReferenceTargets
            module={null}
            targets={targets}
            onSelect={onSelect}
          />
        </LocalizationLoader>
      : null
    )
  }

  private *mapBlockToTargets(block: Block | Document): IterableIterator<ReferenceTarget> {
    for (const child of block.nodes as unknown as Iterable<Node>) {
      if (child.object !== 'block') continue

      let type
      let description = null

      switch (child.type) {
      case 'admonition':
        type = child.data.get('type')
        // fall-through

      case 'example':
      case 'exercise_commentary':
      case 'exercise_solution':
        description = child.nodes.first().text
        break

      case 'figure':
        if ((child.nodes.last() as Block).type === 'figure_caption') {
          description = child.nodes.last().text
        }
        break

      case 'exercise':
        description = (child.nodes.first() as Block).nodes.first().text
        break

      case 'section':
        yield* this.mapBlockToTargets(child)
        continue

      default:
        continue
      }

      const counters = this.state.countersMap.get(child.key) || new Map([[child.type, 0]])

      const target: ReferenceTarget = {
        id: child.key,
        type: type || TYPE_MAP[child.type] || child.type,
        description,
        counter: counters.get(child.type) || 0,
        children: [],
      }

      switch (child.type) {
      case 'exercise':
      case 'figure':
        target.children = Array.from(this.mapBlockToTargets(child))
        yield target
        break

      default:
        yield target
        yield* this.mapBlockToTargets(child)
      }
    }
  }
}

export default connect(mapStateToProps)(LocalResourceTargets)
