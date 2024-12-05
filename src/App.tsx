import { gql, useQuery, QueryResult, OperationVariables, useMutation } from '@apollo/client'
//import './App.css'
import { useState } from 'react'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      id
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
  query{
    allBooks{
      title,
      published,
      author,
      id,
      genres
    }
  }
`

const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
  addBook(title: $title, author: $author, published: $published, genres: $genres) {
    title
    author
    published
    genres
  }
}
`

const SET_BORN = gql`
  mutation editAuthor ($name: String!, $setBornTo: Int) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

interface Author {
  __typename: string,
  name: string,
  born?: number,
  id: string,
  bookCount: number
}

interface AuthorResults {
  allAuthors: Author[]
}

interface Book {
  __typename: string,
  title: string,
  published: number,
  author: string,
  id: string,
  genres: string[]
}

interface BookResults {
  allBooks: Book[]
}

function App() {
  const result = useQuery<AuthorResults>(ALL_AUTHORS)

  type View = 'authors' | 'books' | 'addBook'
  const [view, setView] = useState<View>('authors')


  const Authors = ({result}: {result:QueryResult<AuthorResults, OperationVariables>}) => {
    if (result.loading) {
      return (
        <p>Loading...</p>
      )
    }

    const DisplayAuthor = ({author}:{author:Author}) => {
      return (
        <div style={{display:'flex', justifyContent:'center', border:'1px solid grey'}}>
          <p style={{padding:'0px 5px 0px 5px', margin:4, width:"33%"}}>{author.name}</p>
          <p style={{padding:'0px 5px 0px 5px', margin:4, width:"33%"}}>{author.born ? author.born : 'null'}</p>
          <p style={{padding:'0px 5px 0px 5px', margin:4, width:"33%"}}>{author.bookCount}</p>
        </div>
      )
    }

    
    const SetBirthyear = () => {
      const [setYear, {error}] = useMutation(SET_BORN)

      const handleSubmit = (e: any) => { //: React.FormEvent<HTMLFormElement>
        e.preventDefault()
        const form = e.target
        const formData = new FormData(form)
        const formJson = Object.fromEntries(formData.entries())

        setYear({variables: {
          name: formJson.selectedAuthor.toString(),
          setBornTo: parseInt(formJson.born.toString())
        }})

        result.refetch()
      }
      
      return(
        <form onSubmit={handleSubmit}>
          <h3>Set birthyear</h3>

          <select name='selectedAuthor'>
            {result.data?.allAuthors.map((a, i) => <option key={i} value={a.name}>{a.name}</option>)}
          </select>

          born:
          <input type="text" name='born'/>

          <button>update author</button>

          {error ? <p>{error.message}</p> : <></>}
        </form>
      )
    }

    return (
      <div>
        <h2>Authors:</h2>
        <h4>Name | Year | Books</h4>
        <ul style={{listStyle:'none', paddingLeft:0}}>
          {result.data?.allAuthors.map((a, i) => <li key={i}><DisplayAuthor author={a}/></li>)}
        </ul>

        <SetBirthyear/>
      </div>
    )
  }


  const BookSearch = () => {
    const books = useQuery<BookResults>(ALL_BOOKS)

    if(books.loading) return (<p>Loading...</p>);

    const DisplayBook = ({book}:{book:Book}) => {
      return (
        <div style={{display:'flex', justifyContent:'center', border:'1px solid grey'}}>
          <p style={{padding:'0px 5px 0px 5px', margin:4, width:"50%"}}>{book.title}</p>
          <p style={{padding:'0px 5px 0px 5px', margin:4, width:"30%"}}>{book.author}</p>
          <p style={{padding:'0px 5px 0px 5px', margin:4, width:"20%"}}>{book.published}</p>
        </div>
      )
    }

    return(
      <div>
        <h2>Books</h2>
        <h4>Title | Author | Published</h4>
        <ul style={{listStyle:'none', paddingLeft:0}}>
          {books.data?.allBooks.map((b, i) => <li key={i}><DisplayBook book={b}/></li>)}
        </ul>
      </div>
    )
  }


  const AddBook = () => {
    const [addBook, {loading, error}] = useMutation(ADD_BOOK)

    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [published, setPublished] = useState('')
    const [genre, setGenre] = useState('')

    const [genres, setGenres] = useState<string[]>([])

    const addGenre = () => {
      setGenres([...genres, genre])
    }

    const createBook = () => {
      addBook({variables: {
        title,
        author,
        published: parseInt(published),
        genres
      }})
    }

    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          title
          <input value={title} onChange={(e) => setTitle(e.target.value)}/>
        </div>

        <div>
          author
          <input value={author} onChange={(e) => setAuthor(e.target.value)}/>
        </div>

        <div>
          published
          <input value={published} onChange={(e) => setPublished(e.target.value)}/>
        </div>

        <div>
          genre
          <input value={genre} onChange={(e) => setGenre(e.target.value)}/>
          <button onClick={addGenre}>add genre</button>
        </div>

        <div style={{display:'flex'}}>
          <p>genres:&nbsp;</p>
          {genres.map((g, i) => <p key={i}>{g}&nbsp;</p>)}
        </div>

        <button onClick={createBook}>create book</button>
        {loading ? <p>Loading...</p> : <></>}
        {error ? <p>{error.message}</p> : <></>}
      </form>
    )
  }


  const ViewSwitcher = ({view}: {view:View}) => {
    switch(view) {
      case 'authors':
        return <Authors result={result}/>

      case 'books':
        return <BookSearch/>

      case 'addBook':
        return <AddBook/>

      default:
        return <Authors result={result}/>
    }
  }

  
  return (
    <>
      <h1>GraphQL testing:</h1>
      <div>
        <button onClick={() => setView('authors')}>Authors</button>
        <button onClick={() => setView('books')}>Books</button>
        <button onClick={() => setView('addBook')}>Add Book</button>
      </div>
      <ViewSwitcher view={view}/>
    </>
  )
}

export default App
