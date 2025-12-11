import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const SignupTenantPage: React.FC = () => {
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerFullName, setownerFullName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authService.signupTenant({
      tenantName,
      tenantSlug,
      ownerEmail,
      ownerPassword,
      ownerFullName,
    });
    navigate("/login");
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="mt-5">Create your tenant</h2>
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
            <Form.Group className="mb-3">
              <Form.Label>Owner FullName</Form.Label>
              <Form.Control
                type="text"
                value={ownerFullName}
                onChange={(e) => setownerFullName(e.target.value)}
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

export default SignupTenantPage;
