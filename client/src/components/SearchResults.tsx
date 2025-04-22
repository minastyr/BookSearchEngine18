//import React from 'react'; not needed since this is a typescript file and typescript is crap

const SearchResults = ({ results }: { results: any[] }) => {
  return (
    <div className="search-results">
      <div className="row">
        {results.map((book) => (
          <div key={book.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img
                src={book.volumeInfo.imageLinks?.thumbnail}
                className="card-img-top"
                alt={book.volumeInfo.title}
              />
              <div className="card-body">
                <h5 className="card-title">{book.volumeInfo.title}</h5>
                <p className="card-text">
                  <strong>Author(s):</strong>{" "}
                  {book.volumeInfo.authors?.join(", ")}
                </p>
                <p className="card-text">{book.volumeInfo.description}</p>
                <a
                  href={book.volumeInfo.infoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  View on Google Books
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
