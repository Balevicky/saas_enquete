import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import InviteForm from "./InviteForm";
import inviteService from "../../services/inviteService";
import { useParams } from "react-router-dom";

const InviteList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [invites, setInvites] = useState<any[]>([]);

  const fetch = async () => {
    const res = await inviteService.listInvites(tenantSlug!);
    setInvites(res.data);
  };

  useEffect(() => {
    fetch();
  }, [tenantSlug]);

  return (
    <div className="container mt-4">
      <h3>Invitations</h3>
      <InviteForm tenantSlug={tenantSlug!} onSuccess={fetch} />
      <Table className="mt-4">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Accepted</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.email}</td>
              <td>{inv.role}</td>
              <td>{inv.accepted ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InviteList;
