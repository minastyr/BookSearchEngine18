import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/graphql";
import Auth from "../utils/auth";
import { Form, Button } from "react-bootstrap";

const LoginForm = ({ handleModalClose }: { handleModalClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { error }] = useMutation(LOGIN_USER);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({
        variables: { email, password },
      });

      if (data?.login?.token) {
        Auth.login(data.login.token);
        handleModalClose();
      }
    } catch (err) {
      console.error("Login error:", err);
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
      {error && <p className="text-danger">Login failed. Please try again.</p>}
      <Button variant="primary" type="submit" className="mt-3">
        Login
      </Button>
    </Form>
  );
};

export default LoginForm;
