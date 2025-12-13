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
import { useParams } from "react-router-dom";
import authService from "../../services/authService";

const ForgotPassword: React.FC = () => {
  // 🔹 Récupération du tenant depuis l’URL (/t/:tenantSlug)
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  // 🔹 États du formulaire
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Sécurité : le tenant est obligatoire
    if (!tenantSlug) {
      setError("Tenant missing.");
      return;
    }

    try {
      // Appel backend
      await authService.forgotPassword(tenantSlug, email);

      // Message générique (sécurité)
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
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
              <h3 className="text-center mb-4 fw-bold">Reset your password</h3>

              {/* Message d’erreur */}
              {error && <Alert variant="danger">{error}</Alert>}

              {/* Message de succès */}
              {success ? (
                <Alert variant="success">
                  If this email exists, a reset link has been sent.
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 py-2 fw-semibold rounded-3"
                  >
                    Send reset link
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
