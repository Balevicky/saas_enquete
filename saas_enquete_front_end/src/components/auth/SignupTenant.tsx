import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const SignupTenant: React.FC = () => {
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Ici, on crée le tenant et le premier utilisateur (propriétaire)
      await authService.signupTenant({
        tenantName,
        tenantSlug,
        ownerEmail,
        ownerPassword,
      });

      // Redirection vers le login du tenant créé
      navigate(`/t/${tenantSlug}/login`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="mt-5">Create your tenant</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tenant name</Form.Label>
              <Form.Control
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tenant slug</Form.Label>
              <Form.Control
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Owner Email</Form.Label>
              <Form.Control
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Owner Password</Form.Label>
              <Form.Control
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit">Create</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupTenant;
