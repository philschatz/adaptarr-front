import * as React from 'react'
import { connect } from 'react-redux'
import { Trans } from 'react-i18next'

import axios from 'src/config/axios'

import Section from 'src/components/Section'
import Header from 'src/components/Header'
import AdminUI from 'src/components/AdminUI'
import BookCard from 'src/components/BookCard'
import Spinner from 'src/components/Spinner'
import SuperSession from 'src/components/SuperSession'
import Button from 'src/components/ui/Button'
import Icon from 'src/components/ui/Icon'

import { IsLoading, BooksMap, BookShortInfo } from 'src/store/types'
import { FetchBooksMap, fetchBooksMap } from 'src/store/actions/Books'
import { State } from 'src/store/reducers/index'

type Props = {
  booksMap: {
    isLoading: IsLoading
    booksMap: BooksMap
  }
  fetchBooksMap: () => void
}

export const mapStateToProps = ({ booksMap }: State) => {
  return {
    booksMap,
  }
}

export const mapDispatchToProps = (dispatch: FetchBooksMap) => {
  return {
    fetchBooksMap: () => dispatch(fetchBooksMap()),
  }
}

class Books extends React.Component<Props> {

  state: {
    titleInput: string,
    showSuperSession: boolean,
  } = {
    titleInput: '',
    showSuperSession: false,
  }

  private listOfBookCards = (booksMap: BooksMap) => {
    let books: BookShortInfo[] = []

    // Create new array because we can't render list
    booksMap.forEach(book => {
      books.push(book)
    })

    return books.map((book: BookShortInfo) => {
      return <BookCard key={book.id} book={book}/>
    })
  }

  private addBook = () => {
    axios.post('books', {title: this.state.titleInput})
      .then(() => {
        this.props.fetchBooksMap()
        this.setState({ titleInput: '' })
      })
      .catch(() => {
        this.setState({ showSuperSession: true })
      })
  }

  private updateTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement
    this.setState({ titleInput: input.value })
  }

  private superSessionSuccess = (res: Response) => {
    this.addBook()
    this.setState({ showSuperSession: false })
  }

  private superSessionFailure = (e: Error) => {
    console.log('failure', e.message)
  }

  public render() {
    const { isLoading, booksMap } = this.props.booksMap
    const { titleInput, showSuperSession } = this.state

    return (
      <Section>
        <Header i18nKey="Books.title">
          <AdminUI>
            <input type="text" value={this.state.titleInput} onChange={(e) => this.updateTitleInput(e)} placeholder="Book title" />
            <Button color="green" isDisabled={!(titleInput.length > 0)} clickHandler={this.addBook}>
              <Icon name="plus"/>
            </Button>
          </AdminUI>
        </Header>
        {
          showSuperSession ?
            <SuperSession 
              onSuccess={this.superSessionSuccess} 
              onFailure={this.superSessionFailure}
              onAbort={() => this.setState({ showSuperSession: false })}/>
          : null
        }
        {
          !isLoading ?
            <div className="section__content">
              {
                booksMap.size > 0 ?
                  this.listOfBookCards(booksMap)
                : <Trans i18nKey="Books.noBooksFound" />
              }
            </div>
          :
            <Spinner/>
        }
      </Section>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Books)
