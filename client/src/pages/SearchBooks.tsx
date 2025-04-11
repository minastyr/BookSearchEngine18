import { useState, useEffect, FormEvent } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/graphql';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { searchGoogleBooks } from '../utils/API';
import type { Book } from '../models/Book';
import type { GoogleAPIBook } from '../types/GoogleAPIBook';
console.log('SearchBooks component reached');
console.log('Is user logged in?', Auth.loggedIn());

const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const [saveBook] = useMutation(SAVE_BOOK);

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book: GoogleAPIBook) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.volumeInfo.infoLink || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId: string) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
  
    if (!bookToSave) {
      console.error('Book not found in searchedBooks');
      return;
    }
  
    try {
      const { data } = await saveBook({
        variables: {
          bookId: bookToSave.bookId,
          title: bookToSave.title,
          authors: bookToSave.authors,
          description: bookToSave.description,
          image: bookToSave.image,
          link: '', // Add a link if available
        },
      });
      console.log('Saved book:', data);
  
      // Update savedBookIds state
      setSavedBookIds([...savedBookIds, bookId]);
    } catch (err) {
      console.error('Error saving book:', err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
