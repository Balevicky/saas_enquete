import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AppNavbar: React.FC = () => {
  const { logout, token } = useAuth();

  // Récupération du tenantSlug depuis l'URL
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const ts = tenantSlug || ""; // si pas de tenantSlug, mettre string vide pour éviter erreur

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        {/* Brand / logo */}
        <Navbar.Brand as={Link} to={ts ? `/t/${ts}/dashboard` : "/"}>
          My SaaS
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {token && (
              <>
                {/* Liens internes tenant-aware */}
                <Nav.Link as={Link} to={`/t/${ts}/dashboard`}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to={`/t/${ts}/geo`}>
                  Geo
                </Nav.Link>
                <Nav.Link as={Link} to={`/t/${ts}/invite`}>
                  Invitations
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav>
            {token ? (
              // Bouton logout
              <Nav.Link onClick={logout}>Logout</Nav.Link>
            ) : (
              // Lien login (pas tenant-specific)
              <Nav.Link as={Link} to={ts ? `/t/${ts}/login` : "/login"}>
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
