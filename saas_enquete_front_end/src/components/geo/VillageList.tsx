import React, { useEffect, useState } from "react";
import { Table, Button, Form, Pagination } from "react-bootstrap";
import { useParams } from "react-router-dom";
import geoService from "../../services/geoService";

const VillageList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  // États principaux
  const [villages, setVillages] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [secteurs, setSecteurs] = useState<any[]>([]);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDepartement, setSelectedDepartement] = useState("");
  const [selectedSecteur, setSelectedSecteur] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);

  // ⚡ Fetch régions
  const fetchRegions = async () => {
    const res = await geoService.listRegions(tenantSlug!);
    setRegions(res.data.data);
  };

  // ⚡ Fetch départements selon région
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

  // ⚡ Fetch secteurs selon département
  const fetchSecteurs = async () => {
    if (!selectedDepartement) {
      setSecteurs([]);
      return;
    }
    const res = await geoService.listSecteurs(tenantSlug!, {
      departementId: selectedDepartement,
    });
    setSecteurs(res.data.data);
  };

  // ⚡ Fetch villages avec pagination
  const fetchVillages = async () => {
    if (!selectedSecteur) return;
    const res = await geoService.listVillages(tenantSlug!, {
      secteurId: selectedSecteur,
      page,
      perPage,
    });
    setVillages(res.data.data);
    setTotal(res.data.meta.total);
  };

  // Effets
  useEffect(() => {
    fetchRegions();
  }, [tenantSlug]);
  useEffect(() => {
    setSelectedDepartement("");
    fetchDepartements();
  }, [selectedRegion]);
  useEffect(() => {
    setSelectedSecteur("");
    fetchSecteurs();
  }, [selectedDepartement]);
  useEffect(() => {
    setPage(1);
  }, [selectedSecteur]);
  useEffect(() => {
    fetchVillages();
  }, [tenantSlug, selectedRegion, selectedDepartement, selectedSecteur, page]);

  // Ajouter village
  const handleCreate = async () => {
    if (!newName || !selectedSecteur) return;
    await geoService.createVillage(tenantSlug!, {
      name: newName,
      secteurId: selectedSecteur,
    });
    setNewName("");
    fetchVillages();
  };

  // Edition inline
  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };
  const saveEdit = async (id: string) => {
    await geoService.updateVillage(tenantSlug!, id, { name: editName });
    setEditingId(null);
    fetchVillages();
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // Delete
  const deleteItem = async (id: string) => {
    await geoService.deleteVillage(tenantSlug!, id);
    fetchVillages();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      {/* Filtre par région, département, secteur */}
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

      {selectedDepartement && (
        <Form.Select
          className="mb-3"
          value={selectedSecteur}
          onChange={(e) => setSelectedSecteur(e.target.value)}
        >
          <option value="">-- Select Secteur --</option>
          {secteurs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Form.Select>
      )}

      {/* Formulaire création */}
      {selectedSecteur && (
        <Form className="d-flex gap-2 mb-3">
          <Form.Control
            placeholder="New village"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={handleCreate}>Add</Button>
        </Form>
      )}

      {/* Liste villages */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Village</th>
            <th style={{ width: "200px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {villages.map((v) => (
            <tr key={v.id}>
              <td>
                {editingId === v.id ? (
                  <Form.Control
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  v.name
                )}
              </td>
              <td className="d-flex gap-2">
                {editingId === v.id ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => saveEdit(v.id)}
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
                      onClick={() => startEdit(v.id, v.name)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteItem(v.id)}
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

      {/* Pagination */}
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

export default VillageList;
