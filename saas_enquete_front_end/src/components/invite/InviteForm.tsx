import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import inviteService from "../../services/inviteService";

interface Props {
  tenantSlug: string;
  onSuccess: () => void;
}

const InviteForm: React.FC<Props> = ({ tenantSlug, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await inviteService.createInvite(tenantSlug, email);
      setEmail("");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Send Invite
      </Button>
    </Form>
  );
};

export default InviteForm;
