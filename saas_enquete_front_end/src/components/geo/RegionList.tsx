import React, { useEffect, useState } from "react";
import { Table, Button, Form, Pagination } from "react-bootstrap";
import { useParams } from "react-router-dom";
import geoService from "../../services/geoService";

const RegionList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  // États principaux
  const [regions, setRegions] = useState<any[]>([]); // Liste des régions à afficher
  const [newName, setNewName] = useState(""); // Nouveau nom de région
  const [editingId, setEditingId] = useState<string | null>(null); // Région en édition
  const [editName, setEditName] = useState(""); // Nom temporaire pour édition

  // Pagination serveur
  const [page, setPage] = useState(1); // page courante
  const [perPage] = useState(10); // éléments par page
  const [total, setTotal] = useState(0); // total des régions pour pagination

  // ⚡ Fetch des régions avec pagination
  const fetchRegions = async () => {
    if (!tenantSlug) return;

    // Appel au backend avec page/perPage
    const res = await geoService.listRegions(tenantSlug);

    // Si ton backend supporte pagination via query params, tu peux faire :
    // const res = await geoService.listRegions(tenantSlug, { page, perPage });

    // On met à jour l'état
    setRegions(res.data.data);
    setTotal(res.data.meta?.total || res.data.data.length); // fallback si meta absent
  };

  // Effet React pour fetch régions à chaque changement de page
  useEffect(() => {
    fetchRegions();
  }, [tenantSlug, page]);

  // Ajouter une nouvelle région
  const handleCreate = async () => {
    if (!newName) return;
    await geoService.createRegion(tenantSlug!, newName);
    setNewName("");
    fetchRegions();
  };

  // Commencer l'édition inline
  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  // Sauvegarder édition
  const saveEdit = async (id: string) => {
    await geoService.updateRegion(tenantSlug!, id, { name: editName });
    setEditingId(null);
    fetchRegions();
  };

  // Annuler édition
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // Supprimer une région
  const deleteItem = async (id: string) => {
    await geoService.deleteRegion(tenantSlug!, id);
    fetchRegions();
  };

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      {/* Formulaire ajout région */}
      <Form className="d-flex gap-2 mb-3">
        <Form.Control
          placeholder="New region"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={handleCreate}>Add</Button>
      </Form>

      {/* Tableau des régions */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Region</th>
            <th style={{ width: "200px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.id}>
              <td>
                {editingId === r.id ? (
                  <Form.Control
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  r.name
                )}
              </td>
              <td className="d-flex gap-2">
                {editingId === r.id ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => saveEdit(r.id)}
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
                      size="sm"
                      variant="secondary"
                      onClick={() => startEdit(r.id, r.name)}
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteItem(r.id)}
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

      {/* Pagination serveur */}
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

export default RegionList;
