import React, { useState } from 'react';
import Auth from '../utils/auth';
import { Form, Button } from 'react-bootstrap';

const LoginForm = ({ handleModalClose }: { handleModalClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Replace with your login API logic
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.token) {
        Auth.login(data.token);
        handleModalClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <Form.Group controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-3">
        Submit
      </Button>
    </Form>
  );
};

export default LoginForm;
