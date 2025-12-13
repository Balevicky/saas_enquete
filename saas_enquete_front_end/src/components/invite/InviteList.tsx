import React, { useEffect, useState } from "react";
// Modal
import {
  Table,
  Button,
  Form,
  Pagination,
  Spinner,
  InputGroup,
  Alert,
} from "react-bootstrap";
import inviteService from "../../services/inviteService";

interface Invite {
  id: string;
  email: string;
  role: string;
  accepted: boolean;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
  } | null;
}

const InviteList: React.FC = () => {
  const tenantSlug = localStorage.getItem("tenantSlug");

  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");

  // Create invite
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await inviteService.createInvite(tenantSlug!, email, role);
      setEmail("");
      fetchInvites();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Fetch invites list
  const fetchInvites = async () => {
    if (!tenantSlug) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/t/${tenantSlug}/invites?page=${page}&perPage=${perPage}&search=${search}`
      );

      const json = await res.json();

      setInvites(Array.isArray(json.data) ? json.data : []);
      setTotal(json.meta?.total ?? 0);
    } catch (err) {
      console.error("Fetch invites error", err);
      setInvites([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, [page, search, perPage]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-3">
      {/* HEADER CARD */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="mb-3 fw-semibold">Manage Invitations</h3>

          <Form className="row g-3 align-items-end" onSubmit={handleCreate}>
            {/* Email */}
            <div className="col-md-5">
              <Form.Label className="fw-medium">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div className="col-md-3">
              <Form.Label className="fw-medium">Role</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="EDITOR">Editor</option>
                <option value="ENQUETEUR">INVESTIGATOR</option>
                <option value="SUPERVISEUR">SUPERVISOR</option>
                <option value="VIEWER">Viewer</option>
              </Form.Select>
            </div>

            {/* Submit */}
            <div className="col-md-3 d-grid">
              <Button
                variant="primary"
                type="submit"
                className="fw-semibold py-2"
              >
                + Send Invite
              </Button>
            </div>

            {/* Error */}
            <div className="col-12">
              {error && <Alert variant="danger">{error}</Alert>}
            </div>
          </Form>
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded shadow-sm">
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table
            responsive
            hover
            bordered
            striped
            className="m-0 table-bordered table-striped"
          >
            <thead className="table-dark">
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Sent At</th>
                <th>User</th>
              </tr>
            </thead>

            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No invites found
                  </td>
                </tr>
              ) : (
                invites.map((invite, index) => (
                  <tr key={invite.id}>
                    <td>
                      <strong>{index + 1}</strong>
                    </td>
                    <td>
                      <strong>{invite.email}</strong>
                    </td>
                    <td>{invite.role}</td>
                    <td>
                      {invite.accepted ? (
                        <span className="text-success fw-semibold">
                          Accepted
                        </span>
                      ) : (
                        <span className="text-warning fw-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td>{new Date(invite.createdAt).toLocaleString()}</td>
                    <td>{invite.user ? invite.user.fullName : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* FOOTER PAGINATION + SEARCH */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
        {/* Rows selector */}
        <InputGroup style={{ maxWidth: "200px" }}>
          <Form.Select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5 rows</option>
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
          </Form.Select>
        </InputGroup>

        {/* Search */}
        <Form.Control
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "400px" }}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default InviteList;

// ====================================
// import React, { useEffect, useState } from "react";
// import { Table } from "react-bootstrap";
// import InviteForm from "./InviteForm";
// import inviteService from "../../services/inviteService";
// import { useParams } from "react-router-dom";

// const InviteList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();
//   const [invites, setInvites] = useState<any[]>([]);

//   const fetch = async () => {
//     const res = await inviteService.listInvites(tenantSlug!);

//     // setInvites(res.data);
//     setInvites(Array.isArray(res.data) ? res.data : res.data.invites || []);
//   };

//   useEffect(() => {
//     fetch();
//   }, [tenantSlug]);
//   // console.log(invites);

//   return (
//     <div className="container mt-4">
//       <h3>Invitations</h3>
//       <InviteForm tenantSlug={tenantSlug!} onSuccess={fetch} />
//       <Table className="mt-4">
//         <thead>
//           <tr>
//             <th>Email</th>
//             <th>Role</th>
//             <th>Accepted</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Array.isArray(invites) && invites.length > 0
//             ? invites.map((inv) => (
//                 <tr key={inv.id}>
//                   <td>{inv.email}</td>
//                   <td>{inv.role}</td>
//                   <td>{inv.accepted ? "Yes" : "No"}</td>
//                 </tr>
//               ))
//             : // <p>Aucune invitation</p>
//               null}
//           {/* {invites &&
//             invites.map((inv) => (
//               <tr key={inv.id}>
//                 <td>{inv.email}</td>
//                 <td>{inv.role}</td>
//                 <td>{inv.accepted ? "Yes" : "No"}</td>
//               </tr>
//             ))} */}
//         </tbody>
//       </Table>
//     </div>
//   );
// };

// export default InviteList;
// export default InviteList;
