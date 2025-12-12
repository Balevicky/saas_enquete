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
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Login: React.FC = () => {
  const { tenantSlug: urlSlug } = useParams<{ tenantSlug: string }>();
  const storedSlug = localStorage.getItem("tenantSlug") || "";
  const finalSlug = urlSlug || storedSlug || "";

  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState(finalSlug);
  const [error, setError] = useState("");

  const showSlugField = !urlSlug && !storedSlug;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // slug = priorité : champ → URL → localStorage
    const tenant = slug.trim();

    if (!tenant) {
      setError("Please provide your workspace / tenant identifier.");
      return;
    }

    try {
      await login(email, password, tenant);
      navigate(`/t/${tenant}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Authentication failed.");
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
              <h3 className="text-center mb-4 fw-bold">Log in</h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {showSlugField && (
                  <Form.Group className="mb-3">
                    <Form.Label>Workspace / Tenant Slug</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="ex: acme"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-semibold rounded-3"
                >
                  Log in
                </Button>
              </Form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Can't access your workspace? <a href="/signup">Create one</a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;

// ==========================================================
// import React, { useState } from "react";
// import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
// import { useNavigate, useParams } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";

// const Login: React.FC = () => {
//   const { tenantSlug: urlSlug } = useParams<{ tenantSlug: string }>();
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [slug, setSlug] = useState("");
//   const [error, setError] = useState("");

//   // Slug provenant de l’URL OU du localStorage
//   const storedSlug = localStorage.getItem("tenantSlug");
//   const tenantSlug = urlSlug || storedSlug || null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Si pas de slug connu → on utilise celui saisi
//     const finalSlug = tenantSlug ?? slug;

//     if (!finalSlug) {
//       setError("Tenant slug is required.");
//       return;
//     }

//     try {
//       await login(email, password, finalSlug);

//       navigate(`/t/${finalSlug}/dashboard`);
//     } catch (err: any) {
//       setError(err.response?.data?.error || err.message);
//     }
//   };

//   return (
//     <Container>
//       <Row className="justify-content-md-center">
//         <Col md={6}>
//           <h2 className="mt-5">Login</h2>
//           {error && <Alert variant="danger">{error}</Alert>}
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             {!tenantSlug && (
//               <Form.Group className="mb-3">
//                 <Form.Label>Tenant Slug</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={slug}
//                   onChange={(e) => setSlug(e.target.value)}
//                   required
//                 />
//               </Form.Group>
//             )}

//             <Button variant="primary" type="submit">
//               Login
//             </Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default Login;
