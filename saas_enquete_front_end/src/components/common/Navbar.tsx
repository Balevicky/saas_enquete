// =====================
// import React, { useState, useEffect } from "react";
// import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
// import axios from "../../utils/api";

// interface UserTenant {
//   tenantId: string;
//   slug: string;
//   name: string;
//   role: string;
// }

// const AppNavbar: React.FC = () => {
//   const { tenantSlug, user, logout, setTenantSlug } = useAuth();
//   // const { tenantSlug, user, logout, setTenantSlug } = useAuth();
//   const navigate = useNavigate();

//   const [tenants, setTenants] = useState<UserTenant[]>([]);
//   const [loading, setLoading] = useState(false);

//   // 🔹 Récupère tous les tenants de l’utilisateur
//   useEffect(() => {
//     const fetchTenants = async () => {
//       if (!user) return;
//       setLoading(true);
//       try {
//         const res = await axios.get(`/users/${user.id}/tenants`); // API à créer côté backend
//         setTenants(res.data.tenants);
//       } catch (err) {
//         console.error("Failed to fetch user tenants", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTenants();
//   }, [user]);

//   // 🔹 Change de workspace / tenant
//   const switchTenant = (newTenant: UserTenant) => {
//     if (!newTenant?.slug) return;
//     // 1️⃣ Met à jour tenantSlug dans AuthContext + localStorage
//     localStorage.setItem("tenantSlug", newTenant.slug);
//     setTenantSlug(newTenant.slug);

//     // 2️⃣ Redirection vers dashboard tenant
//     navigate(`/t/${newTenant.slug}/dashboard`);
//   };

//   // 🔹 Helper pour générer les liens multi-tenant
//   const path = (sub: string) => (tenantSlug ? `/t/${tenantSlug}${sub}` : sub);

//   return (
//     <Navbar
//       expand="lg"
//       bg="white"
//       className="px-3 shadow-sm"
//       style={{ minHeight: "64px" }}
//     >
//       <Container fluid>
//         {/* Logo */}
//         <Navbar.Brand as={Link} to={path("/dashboard")} className="fw-bold">
//           <img src="/logo.png" alt="Logo" width={32} height={32} />{" "}
//           {tenantSlug ? tenantSlug.toUpperCase() : "My SaaS"}
//         </Navbar.Brand>

//         <Navbar.Toggle aria-controls="navbar-nav" />
//         <Navbar.Collapse id="navbar-nav">
//           <Nav className="me-auto">
//             {tenantSlug && (
//               <>
//                 <Nav.Link as={Link} to={path("/dashboard")}>
//                   Dashboard
//                 </Nav.Link>
//                 <Nav.Link as={Link} to={path("/geo")}>
//                   Geography
//                 </Nav.Link>
//                 <Nav.Link as={Link} to={path("/invite")}>
//                   Invitations
//                 </Nav.Link>
//               </>
//             )}
//           </Nav>

//           {/* Right: Workspace switcher + user */}
//           <Nav className="ms-auto align-items-center">
//             {/* Workspace / tenant switcher */}
//             {tenantSlug && tenants.length > 0 && (
//               <NavDropdown
//                 title={
//                   <span className="fw-medium">
//                     {tenants.find((t) => t.slug === tenantSlug)?.name ||
//                       tenantSlug}
//                   </span>
//                 }
//                 id="workspace-switcher"
//               >
//                 {tenants.map((t) => (
//                   <NavDropdown.Item
//                     key={t.tenantId}
//                     onClick={() => switchTenant(t)}
//                   >
//                     {t.name} ({t.role})
//                   </NavDropdown.Item>
//                 ))}
//               </NavDropdown>
//             )}

//             {/* User profile */}
//             {user && (
//               <NavDropdown
//                 title={
//                   <img
//                     src={`https://ui-avatars.com/api/?name=${
//                       user.name || user.email
//                     }&background=0D8ABC&color=fff`}
//                     alt="avatar"
//                     className="rounded-circle"
//                     style={{ width: 32, height: 32 }}
//                   />
//                 }
//                 align="end"
//               >
//                 <NavDropdown.Item onClick={() => navigate(path("/settings"))}>
//                   Settings
//                 </NavDropdown.Item>
//                 <NavDropdown.Divider />
//                 <NavDropdown.Item onClick={logout} className="text-danger">
//                   Logout
//                 </NavDropdown.Item>
//               </NavDropdown>
//             )}
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// };

// export default AppNavbar;

// ============================================
import React from "react";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AppNavbar: React.FC = () => {
  const { tenantSlug, user, logout } = useAuth();
  const navigate = useNavigate();

  // Permet de construire les URLs multi-tenant proprement
  const path = (sub: string) => (tenantSlug ? `/t/${tenantSlug}${sub}` : sub);

  return (
    <Navbar
      expand="lg"
      bg="white"
      className="px-3 shadow-sm"
      style={{ minHeight: "64px" }}
    >
      <Container fluid>
        {/* Logo + Workspace */}
        <Navbar.Brand
          as={Link}
          to={tenantSlug ? `/t/${tenantSlug}/dashboard` : "/login"}
          className="fw-bold d-flex align-items-center gap-2"
        >
          <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32 }} />
          <span>{tenantSlug ? tenantSlug.toUpperCase() : "My SaaS"}</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          {/* Left navigation */}
          {tenantSlug && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to={path("/dashboard")}>
                Dashboard
              </Nav.Link>
              {/* <Nav.Link as={Link} to={path("/region")}>
                Geography
              </Nav.Link> */}
              <NavDropdown
                title={
                  <span className="d-flex align-items-center gap-2">
                    Geography
                  </span>
                }
                align="end"
              >
                <NavDropdown.Item onClick={() => navigate(path("/region"))}>
                  Regions
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => navigate(path("/departement"))}
                >
                  Departement
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate(path("/secteur"))}>
                  Sector
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate(path("/village"))}>
                  Village
                </NavDropdown.Item>

                <NavDropdown.Divider />
              </NavDropdown>
              <NavDropdown
                title={
                  <span className="d-flex align-items-center gap-2">
                    Survey
                  </span>
                }
                align="end"
              >
                <NavDropdown.Item onClick={() => navigate(path("/surveys"))}>
                  Survey List
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => navigate(path("/departement"))}
                >
                  Departement
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate(path("/secteur"))}>
                  Sector
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => navigate(path("/village"))}>
                  Village
                </NavDropdown.Item>

                <NavDropdown.Divider />
              </NavDropdown>
              <Nav.Link as={Link} to={path("/invite")}>
                Invitations
              </Nav.Link>
            </Nav>
          )}

          {/* Right - user profile */}
          <Nav className="ms-auto">
            {!user ? (
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
            ) : (
              // <NavDropdown
              //   title={
              //     <span className="d-flex align-items-center gap-2">
              //       <img
              //         src={`https://ui-avatars.com/api/?name=${
              //           user.name || "User"
              //         }&background=0D8ABC&color=fff`}
              //         alt="avatar"
              //         className="rounded-circle"
              //         style={{ width: 32, height: 32 }}
              //       />
              //       <span>{user.name || "User"}</span>
              //     </span>
              //   }
              //   align="end"
              // >
              //   <NavDropdown.Item onClick={() => navigate(path("/settings"))}>
              //     Settings
              //   </NavDropdown.Item>

              //   <NavDropdown.Divider />

              //   <NavDropdown.Item onClick={logout} className="text-danger">
              //     Logout
              //   </NavDropdown.Item>
              // </NavDropdown>
              <NavDropdown
                title={
                  <span className="d-flex align-items-center gap-2">
                    <img
                      src={`https://ui-avatars.com/api/?name=${
                        user.fullName || user.email || "User"
                      }&background=0D8ABC&color=fff`}
                      alt="avatar"
                      className="rounded-circle"
                      style={{ width: 32, height: 32 }}
                    />
                    <span>{user.fullName || user.email || "User"}</span>
                  </span>
                }
                align="end"
              >
                <NavDropdown.Item as={Link} to={path("/settings")}>
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to={path("/register")}>
                  Registrer
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item onClick={logout} className="text-danger">
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

// ==============================================
// import React from "react";
// import { Navbar, Nav, Container } from "react-bootstrap";
// import { Link, useParams } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";

// const AppNavbar: React.FC = () => {
//   const { logout, token, tenantSlug } = useAuth();

//   // Récupération du tenantSlug depuis l'URL
//   const tenantSlugPara = useParams<{ tenantSlug?: string }>();
//   const ts = tenantSlug || tenantSlugPara || ""; // si pas de tenantSlug, mettre string vide pour éviter erreur

//   return (
//     <Navbar bg="light" expand="lg">
//       <Container>
//         {/* Brand / logo */}
//         <Navbar.Brand as={Link} to={ts ? `/t/${ts}/dashboard` : "/"}>
//           My SaaS
//         </Navbar.Brand>

//         <Navbar.Toggle aria-controls="basic-navbar-nav" />
//         <Navbar.Collapse id="basic-navbar-nav">
//           <Nav className="me-auto">
//             {token && (
//               <>
//                 {/* Liens internes tenant-aware */}
//                 <Nav.Link as={Link} to={`/t/${ts}/dashboard`}>
//                   Dashboard
//                 </Nav.Link>
//                 <Nav.Link as={Link} to={`/t/${ts}/geo`}>
//                   Location
//                 </Nav.Link>
//                 <li className="nav-item dropdown">
//                   <a
//                     className="nav-link dropdown-toggle"
//                     href="#"
//                     id="navbarDropdown"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     Location
//                   </a>
//                   <ul
//                     className="dropdown-menu"
//                     aria-labelledby="navbarDropdown"
//                   >
//                     <li>
//                       <Nav.Link
//                         className="dropdown-item"
//                         as={Link}
//                         to={`/t/${ts}/region`}
//                       >
//                         Region
//                       </Nav.Link>
//                     </li>
//                     <li>
//                       <Nav.Link
//                         className="dropdown-item"
//                         as={Link}
//                         to={`/t/${ts}/departement`}
//                       >
//                         Departement
//                       </Nav.Link>
//                     </li>
//                     <li>
//                       <hr className="dropdown-divider" />{" "}
//                       <Nav.Link
//                         className="dropdown-item"
//                         as={Link}
//                         to={`/t/${ts}/secteur`}
//                       >
//                         Secteur
//                       </Nav.Link>
//                     </li>
//                     <li>
//                       <Nav.Link
//                         className="dropdown-item"
//                         as={Link}
//                         to={`/t/${ts}/village`}
//                       >
//                         Village
//                       </Nav.Link>
//                     </li>
//                   </ul>
//                 </li>

//                 <Nav.Link as={Link} to={`/t/${ts}/invite`}>
//                   Invitations
//                 </Nav.Link>
//               </>
//             )}
//           </Nav>

//           <Nav>
//             {token ? (
//               // Bouton logout
//               <Nav.Link onClick={logout}>Logout</Nav.Link>
//             ) : (
//               // Lien login (pas tenant-specific)
//               <Nav.Link as={Link} to={ts ? `/t/${ts}/login` : "/login"}>
//                 Login
//               </Nav.Link>
//             )}
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// };

// export default AppNavbar;
