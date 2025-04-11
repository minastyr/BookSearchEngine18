import { useEffect, useState } from 'react';
import Auth from '../utils/auth';
import { useNavigate } from 'react-router-dom';

type Book = {
  _id: string;
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

  useEffect(() => {
    const fetchSavedBooks = async () => {
      try {
        const token = Auth.getToken();
        if (!token) return;

        const response = await fetch('/api/books', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved books');
        }

        const data = await response.json();
        setSavedBooks(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load saved books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedBooks();
  }, []);

  const handleRemoveBook = async (bookId: string) => {
    const confirmRemove = window.confirm('Are you sure you want to remove this book?');
    if (!confirmRemove) return;

    try {
      const token = Auth.getToken();
      if (!token) return;

      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSavedBooks(savedBooks.filter((book) => book._id !== bookId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
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
    <div className="container my-4">
      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate('/')}
      >
        Back to Search
      </button>
      <h2 className="text-center mb-4">Your Saved Books</h2>
      {savedBooks.length === 0 ? (
        <div className="alert alert-warning text-center" role="alert">
          You have no saved books. Start searching and save your favorite books!
        </div>
      ) : (
        <div className="row">
          {savedBooks.map((book) => (
            <div key={book._id} className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src={book.image}
                  className="card-img-top"
                  alt={book.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text">
                    <strong>Author(s):</strong> {book.authors.join(', ')}
                  </p>
                  <p className="card-text">{book.description}</p>
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary mt-auto"
                  >
                    View on Google Books
                  </a>
                  <button
                    className="btn btn-danger mt-2"
                    onClick={() => handleRemoveBook(book._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedBooks;