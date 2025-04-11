import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Modal, Tab, Form, Button } from 'react-bootstrap';
import SignUpForm from './SignupForm';
import LoginForm from './LoginForm';
import SearchResults from './SearchResults';  


import Auth from '../utils/auth';

const AppNavbar = () => {
  // set modal display state
  const [showModal, setShowModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchInput}`);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (err) {
      console.error(err);
    }
    setSearchInput('');
  };

  return (
    <>
      <Navbar bg='dark' variant='dark' expand='lg'>
        <Container fluid>
          <Navbar.Brand as={Link} to='/'>
            Google Books Search
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='navbar' />
          <Navbar.Collapse id='navbar' className='d-flex flex-row-reverse'>
            <Nav className='ml-auto d-flex align-items-center'>
              <Nav.Link as={Link} to='/'>
                Search For Books
              </Nav.Link>
              {/* Search input field */}
              <Form className='d-flex' onSubmit={handleSearchSubmit}>
                <Form.Control
                  type='text'
                  placeholder='Search for books'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className='me-2'
                />
                <Button type='submit' variant='outline-light'>
                  Submit
                </Button>
              </Form>
              {/* if user is logged in show saved books and logout */}
              {Auth.loggedIn() ? (
                <>
                  <Nav.Link as={Link} to='/saved'>
                    See Your Books
                  </Nav.Link>
                  <Nav.Link onClick={Auth.logout}>Logout</Nav.Link>
                </>
              ) : (
                <Nav.Link onClick={() => setShowModal(true)}>Login/Sign Up</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Render search results */}
      {searchResults.length > 0 && <SearchResults results={searchResults} />}
      {/* set modal data up */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login / Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tab.Container defaultActiveKey="login">
            <Nav variant="pills" className="justify-content-center mb-3">
              <Nav.Item>
                <Nav.Link eventKey="login">Login</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="signup">Sign Up</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="login">
                <LoginForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
              <Tab.Pane eventKey="signup">
                <SignUpForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AppNavbar;
