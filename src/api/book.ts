import axios from 'src/config/axios'

import Base from './base'
import BookPart from './bookpart'

export type BookData = {
  id: string,
  title: string,
}

export type Diff = {
  title?: string,
}

export type NewModule = {
  title?: string,
  module: string,
}

export type NewGroup = {
  title: string,
  parts?: (NewModule | NewGroup)[],
}

export type NewPart = (NewModule | NewGroup) & {
  parent: number,
  index: number,
}

/**
 * Result of creating a new part in a book.
 */
export type NewPartData = {
  /**
   * Unique (within a book) ID of the created part.
   */
  number: number,

  /**
   * List of parts just created within this group.
   *
   * Present only if the part to be created was a group.
   */
  parts?: NewPartData[],
}

export default class Book extends Base<BookData> {
  /**
   * Load a book by ID.
   */
  static async load(id: string): Promise<Book> {
    const rsp = await axios.get(`books/${id}`)
    return new Book(rsp.data)
  }

  /**
   * Fetch list of all books.
   */
  static async all(): Promise<Book[]> {
    const books = await axios.get('books')
    return books.data.map((data: BookData) => new Book(data))
  }

  /**
   * Create a new book.
   *
   * @param title   title of the book
   * @param content file containing initial contents of the book, in format
   * compatible with Connexion's ZIP export
   */
  static async create(title: string, content?: File): Promise<Book> {
    let data

    if (content) {
      data = new FormData()
      data.append('title', title)
      data.append('file', content)
    } else {
      data = { title }
    }

    let res = await axios.post('books', data)
    return new Book(res.data)
  }

  /**
   * Book's ID.
   */
  id: string

  /**
   * Book's title.
   */
  title: string

  /**
   * Fetch this book's structure.
   */
  async parts(): Promise<BookPart> {
    const rsp = await axios.get(`books/${this.id}/parts`)
    return new BookPart(rsp.data, this)
  }

  /**
   * Replace contents of this book with a ZIPped collection.
   */
  async replaceContent(file: File): Promise<void> {
    await axios.put(`books/${this.id}`, file)
  }

  /**
   * Update this book.
   */
  async update(diff: Diff): Promise<void> {
    await axios.put(`books/${this.id}`, diff)
  }

  /**
   * Create a new book part.
   */
  async createPart(data: NewPart): Promise<NewPartData> {
    const rsp = await axios.post(`books/${this.id}/parts`, data)
    return rsp.data
  }

  /**
   * Delete this book.
   */
  async delete(): Promise<void> {
    await axios.delete(`books/${this.id}`)
  }
}
