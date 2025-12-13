import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const ResetPassword: React.FC = () => {
  // 🔹 Tenant depuis l’URL
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  // 🔹 Token depuis l’URL ?token=xxxx
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  // 🔹 États
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * Soumission du nouveau mot de passe
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sécurité minimale
    if (!tenantSlug || !token) {
      setError("Invalid reset link.");
      return;
    }

    try {
      // Appel backend
      await authService.resetPassword(tenantSlug, token, password);

      // Redirection vers login après succès
      navigate(`/t/${tenantSlug}/login`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Reset failed.");
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <Card className="shadow-sm rounded-4 p-4">
            <Card.Body>
              <h3 className="text-center mb-4 fw-bold">
                Choose a new password
              </h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>New password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 py-2 fw-semibold rounded-3"
                >
                  Reset password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
