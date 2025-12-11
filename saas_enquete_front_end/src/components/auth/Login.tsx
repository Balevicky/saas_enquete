import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Login: React.FC = () => {
  const { tenantSlug: urlSlug } = useParams<{ tenantSlug: string }>();
  const { login } = useAuth(); // utilise le login du AuthContext
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔹 On récupère le slug depuis l'URL ou depuis le localStorage
  const tenantSlug = urlSlug || localStorage.getItem("tenantSlug");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantSlug) {
      setError("Tenant missing in URL or storage");
      return;
    }

    try {
      // 🔹 Appel au login via AuthContext pour gérer token + slug
      await login(email, password);

      // 🔹 Redirection vers dashboard tenant
      navigate(`/t/${tenantSlug}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="mt-5">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
