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
import authService from "../../services/authService";

const Register: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tenantSlug) {
      setError("Tenant missing in URL.");
      return;
    }

    try {
      await authService.register(tenantSlug, {
        fullName,
        email,
        password,
        role,
      });

      navigate(`/t/${tenantSlug}/login`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "90vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <Card className="shadow-sm rounded-4 p-4">
            <Card.Body>
              <h3 className="text-center mb-4 fw-bold">Create an account</h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </Form.Group>

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

                <Form.Group className="mb-3">
                  {/* <Form.Label className="fw-medium">Role</Form.Label> */}
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ENQUETEUR">Investigator</option>
                    <option value="SUPERVISEUR">Supervisor</option>
                    <option value="VIEWER">Viewer</option>
                  </Form.Select>
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
                  Register
                </Button>
              </Form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Already have an account?{" "}
                  <a href={`/t/${tenantSlug}/login`}>Log in</a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;

// ====================================
// import React, { useState } from "react";
// import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
// import { useNavigate, useParams } from "react-router-dom";
// import authService from "../../services/authService";

// const Register: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>(); // récupère le tenant depuis l'URL
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [error, setError] = useState("");
//   const [role, setRole] = useState("USER");
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!tenantSlug) {
//       setError("Tenant missing in URL");
//       return;
//     }

//     try {
//       // On passe le tenantSlug au backend pour créer l'utilisateur dans le tenant spécifique
//       await authService.register(tenantSlug, {
//         email,
//         password,
//         fullName,
//         role,
//       });

//       // Redirection vers le login du tenant
//       navigate(`/t/${tenantSlug}/login`);
//     } catch (err: any) {
//       setError(err.response?.data?.error || err.message);
//     }
//   };

//   return (
//     <Container>
//       <Row className="justify-content-md-center">
//         <Col md={6}>
//           <h2 className="mt-5">Register</h2>
//           {error && <Alert variant="danger">{error}</Alert>}
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>Full name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 required
//               />
//             </Form.Group>
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
//               <Form.Label className="fw-medium">Role</Form.Label>
//               <Form.Select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//               >
//                 <option value="USER">User</option>
//                 <option value="ADMIN">Admin</option>
//                 <option value="EDITOR">Editor</option>
//                 <option value="ENQUETEUR">INVESTIGATOR</option>
//                 <option value="SUPERVISEUR">SUPERVISOR</option>
//                 <option value="VIEWER">Viewer</option>
//               </Form.Select>
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
//             <Button variant="primary" type="submit">
//               Register
//             </Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default Register;
