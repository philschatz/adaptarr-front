import * as React from 'react'
import * as PropTypes from 'prop-types'
import { Localized } from 'fluent-react/compat'

import Storage, { FileDescription } from 'src/api/storage'

import store from 'src/store'
import { addAlert } from 'src/store/actions/Alerts'

import AssetPreview from 'src/components/AssetPreview'
import Button from 'src/components/ui/Button'
import Icon from 'src/components/ui/Icon'

import mimeToRegExp from 'src/helpers/mimeToRegExp'

import './index.css'

export type Props = {
  filter?: string,
  onSelect?: (asset: FileDescription) => void,
}

export default class AssetList extends React.Component<Props> {
  static contextTypes = {
    storage: PropTypes.instanceOf(Storage),
  }

  constructor(a: any, b?: any) {
    super(a, b)

    this.fileInput = document.createElement('input')
    this.fileInput.type = 'file'
    this.fileInput.addEventListener('change', this.onFilesSelected)
  }

  fileInput: HTMLInputElement

  render() {
    const { storage } = this.context
    const pattern = mimeToRegExp(this.props.filter || '*/*')

    return (
      <ul className="assetList">
        <li className="assetList__item">
          <Button clickHandler={this.onAddMedia}>
            <Icon name="plus" />
            <Localized id="asset-list-add-media">Add media</Localized>
          </Button>
        </li>
        {storage.files
          .filter(({ mime }: FileDescription) => mime.match(pattern) !== null)
          .map((file: FileDescription) => (
            <li key={file.name} className="assetList__item">
              <AssetPreview
                asset={file}
                onClick={this.onClickAsset}
              />
            </li>
          ))
        }
      </ul>
    )
  }

  private onAddMedia = () => {
    this.fileInput.click()
  }

  // TODO: there should be some visual interface for previewing selected files
  // before upload, tracking upload progress, etc.
  private onFilesSelected = async () => {
    const { storage } = this.context

    try {
      await Promise.all(
        Array.from(this.fileInput.files!, file => storage.writeFile(file)))

      // XXX: Since Storage is mutable there's nothing we can update
      // in state to cause rerender, and thus we have to force it.
      this.forceUpdate()
    } catch (ex) {
      store.dispatch(addAlert('error', 'asset-list-add-error', {
        details: ex.response.data.raw,
      }))
      console.error(ex)
    }
  }

  private onClickAsset = (ev: React.MouseEvent, asset: FileDescription) => {
    const { onSelect } = this.props

    if (onSelect) onSelect(asset)
  }
}
