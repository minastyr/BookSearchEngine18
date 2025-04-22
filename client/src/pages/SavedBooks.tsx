import { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, REMOVE_BOOK } from '../utils/graphql';

type Book = {
  _id: string;
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
};

const SavedBooks = () => {
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data, loading: queryLoading, error: queryError } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK, {
    refetchQueries: [{ query: GET_ME }],
  });

  useEffect(() => {
    if (data && data.me) {
      setSavedBooks(data.me.savedBooks);
      setLoading(false);
    }
    if (queryError) {
      setError('Failed to load saved books. Please try again later.');
      setLoading(false);
    }
  }, [data, queryError]);

  const handleRemoveBook = async (bookId: string) => {
    const confirmRemove = window.confirm('Are you sure you want to remove this book?');
    if (!confirmRemove) return;

    try {
      const bookToRemove = savedBooks.find((book) => book._id === bookId);
      
      if (!bookToRemove) {
        return;
      }
      
      const { data } = await removeBook({
        variables: { bookId },
      });

      if (!data?.removeBook) {
        console.error('Failed to remove book from MongoDB:', data);
      }
      // Let refetchQueries handle state update
    } catch (err) {
      console.error('Error removing book from MongoDB:', err);
    }
  };

  if (loading || queryLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-4">
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <Button
        className="btn btn-secondary mb-4"
        onClick={() => navigate('/')}
      >
        Back to Search
      </Button>
      <h2 className="text-center mb-4">Your Saved Books</h2>
      {savedBooks.length === 0 ? (
        <div className="alert alert-warning text-center" role="alert">
          You have no saved books. Start searching and save your favorite books!
        </div>
      ) : (
        <Row>
          {savedBooks.map((book) => (
            <Col key={book._id} md="4" className="mb-4">
              <Card className="h-100">
                <Card.Img
                  src={book.image}
                  alt={book.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Text>
                    <strong>Author(s):</strong> {book.authors.join(', ')}
                  </Card.Text>
                  <Card.Text>{book.description}</Card.Text>
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary mt-auto"
                  >
                    View on Google Books
                  </a>
                  <Button
                    className="btn btn-danger mt-2"
                    onClick={() => handleRemoveBook(book.bookId)}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SavedBooks;
