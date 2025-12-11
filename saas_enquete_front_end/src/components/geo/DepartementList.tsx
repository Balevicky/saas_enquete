import React, { useEffect, useState } from "react";
import { Table, Button, Form, Pagination } from "react-bootstrap";
import { useParams } from "react-router-dom";
import geoService from "../../services/geoService";

const DepartementList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [departements, setDepartements] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchRegions = async () => {
    const res = await geoService.listRegions(tenantSlug!);
    setRegions(res.data.data);
  };

  const fetchDepartements = async () => {
    if (!selectedRegion) return;
    const res = await geoService.listDepartements(tenantSlug!, {
      regionId: selectedRegion,
      page,
      perPage,
    });
    setDepartements(res.data.data);
    setTotal(res.data.meta.total);
  };

  useEffect(() => {
    fetchRegions();
  }, [tenantSlug]);

  useEffect(() => {
    setPage(1);
  }, [selectedRegion]);

  useEffect(() => {
    fetchDepartements();
  }, [tenantSlug, selectedRegion, page]);

  const handleCreate = async () => {
    if (!newName || !selectedRegion) return;
    await geoService.createDepartement(tenantSlug!, {
      name: newName,
      regionId: selectedRegion,
    });
    setNewName("");
    fetchDepartements();
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = async (id: string) => {
    await geoService.updateDepartement(tenantSlug!, id, { name: editName });
    setEditingId(null);
    fetchDepartements();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const deleteItem = async (id: string) => {
    await geoService.deleteDepartement(tenantSlug!, id);
    fetchDepartements();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <Form.Select
        className="mb-3"
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
      >
        <option value="">-- Select Region --</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Form.Select>

      {selectedRegion && (
        <Form className="d-flex gap-2 mb-3">
          <Form.Control
            placeholder="New departement"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={handleCreate}>Add</Button>
        </Form>
      )}

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Departement</th>
            <th style={{ width: "200px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departements.map((d) => (
            <tr key={d.id}>
              <td>
                {editingId === d.id ? (
                  <Form.Control
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  d.name
                )}
              </td>
              <td className="d-flex gap-2">
                {editingId === d.id ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => saveEdit(d.id)}
                    >
                      Save
                    </Button>
                    <Button variant="secondary" size="sm" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => startEdit(d.id, d.name)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteItem(d.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i}
              active={i + 1 === page}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </div>
  );
};

export default DepartementList;
