import React, { useEffect, useState } from "react";
import { Table, Button, Form, Pagination } from "react-bootstrap";
import { useParams } from "react-router-dom";
import geoService from "../../services/geoService";

const SecteurList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  // États principaux
  const [secteurs, setSecteurs] = useState<any[]>([]); // liste des secteurs à afficher
  const [regions, setRegions] = useState<any[]>([]); // pour filtrer par région
  const [departements, setDepartements] = useState<any[]>([]); // pour filtrer par département
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDepartement, setSelectedDepartement] = useState("");
  const [newName, setNewName] = useState(""); // nouveau secteur
  const [editingId, setEditingId] = useState<string | null>(null); // secteur en édition
  const [editName, setEditName] = useState(""); // nom temporaire en édition

  // Pagination serveur
  const [page, setPage] = useState(1);
  const [perPage] = useState(10); // nombre d'éléments par page
  const [total, setTotal] = useState(0); // total des secteurs pour pagination

  // ⚡ Fetch des régions au chargement
  const fetchRegions = async () => {
    const res = await geoService.listRegions(tenantSlug!);
    setRegions(res.data.data);
  };

  // ⚡ Fetch des départements selon région sélectionnée
  const fetchDepartements = async () => {
    if (!selectedRegion) {
      setDepartements([]);
      return;
    }
    const res = await geoService.listDepartements(tenantSlug!, {
      regionId: selectedRegion,
    });
    setDepartements(res.data.data);
  };

  // ⚡ Fetch des secteurs selon région + département + pagination
  const fetchSecteurs = async () => {
    if (!selectedRegion || !selectedDepartement) return;
    const res = await geoService.listSecteurs(tenantSlug!, {
      regionId: selectedRegion,
      departementId: selectedDepartement,
      page,
      perPage,
    });
    setSecteurs(res.data.data);
    setTotal(res.data.meta.total);
  };

  // Effets React
  useEffect(() => {
    fetchRegions();
  }, [tenantSlug]); // fetch régions au démarrage
  useEffect(() => {
    setSelectedDepartement("");
    fetchDepartements();
  }, [selectedRegion]); // reset départements quand région change
  useEffect(() => {
    setPage(1);
  }, [selectedDepartement]); // reset page si département change
  useEffect(() => {
    fetchSecteurs();
  }, [tenantSlug, selectedRegion, selectedDepartement, page]); // fetch secteurs

  // Ajouter un nouveau secteur
  const handleCreate = async () => {
    if (!newName || !selectedDepartement) return;
    await geoService.createSecteur(tenantSlug!, {
      name: newName,
      departementId: selectedDepartement,
    });
    setNewName("");
    fetchSecteurs();
  };

  // Gestion de l'édition inline
  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };
  const saveEdit = async (id: string) => {
    await geoService.updateSecteur(tenantSlug!, id, { name: editName });
    setEditingId(null);
    fetchSecteurs();
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // Supprimer un secteur
  const deleteItem = async (id: string) => {
    await geoService.deleteSecteur(tenantSlug!, id);
    fetchSecteurs();
  };

  // Nombre total de pages pour pagination
  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      {/* Filtre par région */}
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

      {/* Filtre par département */}
      {selectedRegion && (
        <Form.Select
          className="mb-3"
          value={selectedDepartement}
          onChange={(e) => setSelectedDepartement(e.target.value)}
        >
          <option value="">-- Select Departement --</option>
          {departements.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Form.Select>
      )}

      {/* Formulaire création secteur */}
      {selectedDepartement && (
        <Form className="d-flex gap-2 mb-3">
          <Form.Control
            placeholder="New secteur"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={handleCreate}>Add</Button>
        </Form>
      )}

      {/* Liste secteurs avec édition inline et suppression */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Secteur</th>
            <th style={{ width: "200px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {secteurs.map((s) => (
            <tr key={s.id}>
              <td>
                {editingId === s.id ? (
                  <Form.Control
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  s.name
                )}
              </td>
              <td className="d-flex gap-2">
                {editingId === s.id ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => saveEdit(s.id)}
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
                      onClick={() => startEdit(s.id, s.name)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteItem(s.id)}
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

export default SecteurList;
