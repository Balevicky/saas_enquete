import React, { useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const SignupTenantPage: React.FC = () => {
  const navigate = useNavigate();

  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerFullName, setownerFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Génère automatiquement un slug propre
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const finalSlug = tenantSlug || generateSlug(tenantName);

    if (!finalSlug) {
      setError("Please choose a workspace identifier (slug).");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        tenantName,
        tenantSlug: finalSlug,
        ownerEmail,
        ownerPassword,
        ownerFullName,
      };

      const res = await authService.signupTenant(payload);

      // Stocke slug + token en localStorage
      localStorage.setItem("tenantSlug", finalSlug);
      localStorage.setItem("token", res.token);

      navigate(`/t/${finalSlug}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Unable to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center mt-4 "
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={7} lg={6}>
          <Card className="shadow-sm rounded-4 p-4">
            <Card.Body>
              <h3 className="text-center mb-4 fw-bold">
                Create your workspace
              </h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Workspace Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: Acme Corporation"
                    value={tenantName}
                    onChange={(e) => {
                      setTenantName(e.target.value);
                      setTenantSlug(generateSlug(e.target.value));
                    }}
                    required
                  />
                  <Form.Text className="text-muted">
                    Your team name or organization name.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Workspace Identifier (slug)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ex: acme"
                    value={tenantSlug}
                    onChange={(e) =>
                      setTenantSlug(generateSlug(e.target.value))
                    }
                    required
                  />
                  <Form.Text className="text-muted">
                    Used in your URL:{" "}
                    <strong>
                      https://app.com/t/{tenantSlug || "workspace"}
                    </strong>
                  </Form.Text>
                </Form.Group>

                <hr className="my-4" />

                <Form.Group className="mb-3">
                  <Form.Label>Owner Fullname</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Henri Dupont"
                    value={ownerFullName}
                    onChange={(e) => setownerFullName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Owner Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 py-2 fw-semibold rounded-3"
                  disabled={loading}
                >
                  {loading ? "Creating workspace..." : "Create workspace"}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Already have an account? <a href="/login">Login in</a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupTenantPage;

// =======================================
// import React, { useState } from "react";
// import { Container, Row, Col, Form, Button } from "react-bootstrap";
// import authService from "../services/authService";
// import { useNavigate } from "react-router-dom";

// const SignupTenantPage: React.FC = () => {
//   const [tenantName, setTenantName] = useState("");
//   const [tenantSlug, setTenantSlug] = useState("");
//   const [ownerEmail, setOwnerEmail] = useState("");
//   const [ownerPassword, setOwnerPassword] = useState("");
//   const [ownerFullName, setownerFullName] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await authService.signupTenant({
//       tenantName,
//       tenantSlug,
//       ownerEmail,
//       ownerPassword,
//       ownerFullName,
//     });
//     navigate("/login");
//   };

//   return (
//     <Container>
//       <Row className="justify-content-md-center">
//         <Col md={6}>
//           <h2 className="mt-5">Create your tenant</h2>
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>Tenant name</Form.Label>
//               <Form.Control
//                 value={tenantName}
//                 onChange={(e) => setTenantName(e.target.value)}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Tenant slug</Form.Label>
//               <Form.Control
//                 value={tenantSlug}
//                 onChange={(e) => setTenantSlug(e.target.value)}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Owner Email</Form.Label>
//               <Form.Control
//                 type="email"
//                 value={ownerEmail}
//                 onChange={(e) => setOwnerEmail(e.target.value)}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Owner Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 value={ownerPassword}
//                 onChange={(e) => setOwnerPassword(e.target.value)}
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Owner FullName</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={ownerFullName}
//                 onChange={(e) => setownerFullName(e.target.value)}
//                 required
//               />
//             </Form.Group>
//             <Button type="submit">Create</Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default SignupTenantPage;
