import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Pagination,
  Spinner,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import geoService from "../../services/geoService";

const SecteurList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  const [regions, setRegions] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [secteurs, setSecteurs] = useState<any[]>([]);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDepartement, setSelectedDepartement] = useState("");

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  /** Load regions */
  const fetchRegions = async () => {
    const res = await geoService.listRegions(tenantSlug!);
    setRegions(res.data.data);
  };

  /** Load departements */
  const fetchDepartements = async () => {
    if (!selectedRegion) return;
    const res = await geoService.listDepartements(tenantSlug!, {
      regionId: selectedRegion,
    });
    setDepartements(res.data.data);
  };

  /** Load secteurs */
  const fetchSecteurs = async () => {
    if (!selectedDepartement) return;

    setLoading(true);

    const res = await geoService.listSecteurs(tenantSlug!, {
      departementId: selectedDepartement,
    });

    let list = res.data.data;

    if (search.trim() !== "") {
      list = list.filter((s: any) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setSecteurs(list);
    setTotal(list.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegions();
  }, [tenantSlug]);

  useEffect(() => {
    setSelectedDepartement("");
    setSecteurs([]);
    setSearch("");
    fetchDepartements();
  }, [selectedRegion]);

  useEffect(() => {
    fetchSecteurs();
    setPage(1);
  }, [selectedDepartement]);

  useEffect(() => {
    fetchSecteurs();
  }, [page, search, perPage]);

  const handleCreate = async () => {
    if (!newName.trim() || !selectedDepartement) return;

    await geoService.createSecteur(tenantSlug!, {
      name: newName,
      departementId: selectedDepartement,
    });

    setNewName("");
    fetchSecteurs();
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = async (id: string) => {
    await geoService.updateSecteur(tenantSlug!, id, { name: editName });
    setEditingId(null);
    fetchSecteurs();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="mb-3 fw-semibold">Manage Secteurs</h3>

          <Form className="row g-3 align-items-end">
            {/* Region */}
            <div className="col-md-4">
              <Form.Label className="fw-medium">Region</Form.Label>
              <Form.Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">Select region...</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Departement */}
            <div className="col-md-4">
              <Form.Label className="fw-medium">Departement</Form.Label>
              <Form.Select
                value={selectedDepartement}
                onChange={(e) => setSelectedDepartement(e.target.value)}
                disabled={!selectedRegion}
              >
                <option value="">Select departement...</option>
                {departements.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* New secteur */}
            <div className="col-md-4">
              <Form.Label className="fw-medium">New secteur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={!selectedDepartement}
              />
            </div>

            {/* Add Button */}
            <div className="col-md-12 d-grid">
              <Button
                variant="primary"
                className="fw-semibold py-2 d-grid gap-2 col-6 mx-auto"
                onClick={handleCreate}
                disabled={!selectedDepartement}
                style={{ maxWidth: "300px" }}
              >
                + Add
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Table */}
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
                <th style={{ width: "30px" }}>N°</th>
                <th>Secteur</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {secteurs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">
                    No secteurs found
                  </td>
                </tr>
              ) : (
                secteurs
                  .slice((page - 1) * perPage, page * perPage)
                  .map((s, index) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{index + 1}</strong>
                      </td>
                      <td>
                        {editingId === s.id ? (
                          <Form.Control
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <strong>{s.name}</strong>
                        )}
                      </td>

                      <td className="d-flex gap-2">
                        {editingId === s.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => saveEdit(s.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => startEdit(s.id, s.name)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setConfirmDeleteId(s.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Pagination + filters */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
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
            <option value={100}>100 rows</option>
          </Form.Select>
        </InputGroup>

        <Form.Control
          placeholder="Search secteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "400px" }}
        />

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

      {/* Confirm delete modal */}
      <Modal
        show={Boolean(confirmDeleteId)}
        onHide={() => setConfirmDeleteId(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this secteur?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await geoService.deleteSecteur(tenantSlug!, confirmDeleteId!);
              setConfirmDeleteId(null);
              fetchSecteurs();
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SecteurList;

// ========================================== bon mais pas responsive
// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Button,
//   Form,
//   Pagination,
//   Spinner,
//   Modal,
// } from "react-bootstrap";
// import { useParams } from "react-router-dom";
// import geoService from "../../services/geoService";

// const SecteurList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   const [regions, setRegions] = useState<any[]>([]);
//   const [departements, setDepartements] = useState<any[]>([]);
//   const [secteurs, setSecteurs] = useState<any[]>([]);

//   const [selectedRegion, setSelectedRegion] = useState("");
//   const [selectedDepartement, setSelectedDepartement] = useState("");

//   const [newName, setNewName] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editName, setEditName] = useState("");

//   const [page, setPage] = useState(1);
//   const [perPage, setPerPage] = useState(10);
//   const [total, setTotal] = useState(0);

//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

//   /** Load regions */
//   const fetchRegions = async () => {
//     const res = await geoService.listRegions(tenantSlug!);
//     setRegions(res.data.data);
//   };

//   /** Load departements when region changes */
//   const fetchDepartements = async () => {
//     if (!selectedRegion) return;
//     const res = await geoService.listDepartements(tenantSlug!, {
//       regionId: selectedRegion,
//     });
//     setDepartements(res.data.data);
//   };

//   /** Load secteurs */
//   const fetchSecteurs = async () => {
//     if (!selectedDepartement) return;

//     setLoading(true);

//     const res = await geoService.listSecteurs(tenantSlug!, {
//       departementId: selectedDepartement,
//     });

//     let list = res.data.data;

//     if (search.trim() !== "") {
//       list = list.filter((s: any) =>
//         s.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     setSecteurs(list);
//     setTotal(list.length);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchRegions();
//   }, [tenantSlug]);

//   useEffect(() => {
//     setSelectedDepartement("");
//     setSecteurs([]);
//     setSearch("");
//     fetchDepartements();
//   }, [selectedRegion]);

//   useEffect(() => {
//     fetchSecteurs();
//     setPage(1);
//   }, [selectedDepartement]);

//   useEffect(() => {
//     fetchSecteurs();
//   }, [page, search, perPage]);

//   /** Create secteur */
//   const handleCreate = async () => {
//     if (!newName.trim() || !selectedDepartement) return;

//     await geoService.createSecteur(tenantSlug!, {
//       name: newName,
//       departementId: selectedDepartement,
//     });

//     setNewName("");
//     fetchSecteurs();
//   };

//   /** Edit secteur */
//   const startEdit = (id: string, name: string) => {
//     setEditingId(id);
//     setEditName(name);
//   };

//   const saveEdit = async (id: string) => {
//     await geoService.updateSecteur(tenantSlug!, id, { name: editName });
//     setEditingId(null);
//     fetchSecteurs();
//   };

//   const totalPages = Math.ceil(total / perPage);

//   return (
//     <div className="p-3">
//       {/* Filters + Create */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <Form className="d-flex gap-2 flex-grow-1">
//           <Form.Select
//             style={{ minWidth: "200px" }}
//             value={selectedRegion}
//             onChange={(e) => setSelectedRegion(e.target.value)}
//           >
//             <option value="">-- Select Region --</option>
//             {regions.map((r) => (
//               <option key={r.id} value={r.id}>
//                 {r.name}
//               </option>
//             ))}
//           </Form.Select>

//           <Form.Select
//             style={{ minWidth: "200px" }}
//             value={selectedDepartement}
//             onChange={(e) => setSelectedDepartement(e.target.value)}
//             disabled={!selectedRegion}
//           >
//             <option value="">-- Select Departement --</option>
//             {departements.map((d) => (
//               <option key={d.id} value={d.id}>
//                 {d.name}
//               </option>
//             ))}
//           </Form.Select>

//           <Form.Control
//             placeholder="New secteur"
//             value={newName}
//             onChange={(e) => setNewName(e.target.value)}
//             disabled={!selectedDepartement}
//           />

//           <Button
//             variant="primary"
//             onClick={handleCreate}
//             disabled={!selectedDepartement}
//           >
//             + Add
//           </Button>
//         </Form>
//       </div>

//       {/* Table */}
//       <div className="border rounded shadow-sm">
//         {loading ? (
//           <div className="text-center p-5">
//             <Spinner animation="border" />
//           </div>
//         ) : (
//           <Table responsive hover className="m-0">
//             <thead className="table-light">
//               <tr>
//                 <th style={{ width: "60px" }}>N°</th>
//                 <th>Secteur</th>
//                 <th style={{ width: "160px" }}>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {secteurs.length === 0 ? (
//                 <tr>
//                   <td colSpan={3} className="text-center py-4 text-muted">
//                     No secteurs found
//                   </td>
//                 </tr>
//               ) : (
//                 secteurs
//                   .slice((page - 1) * perPage, page * perPage)
//                   .map((s, index) => (
//                     <tr key={s.id}>
//                       <td className="text-muted">
//                         {(page - 1) * perPage + index + 1}
//                       </td>

//                       <td>
//                         {editingId === s.id ? (
//                           <Form.Control
//                             value={editName}
//                             onChange={(e) => setEditName(e.target.value)}
//                             autoFocus
//                           />
//                         ) : (
//                           <strong>{s.name}</strong>
//                         )}
//                       </td>

//                       <td className="d-flex gap-2">
//                         {editingId === s.id ? (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="success"
//                               onClick={() => saveEdit(s.id)}
//                             >
//                               Save
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="secondary"
//                               onClick={() => setEditingId(null)}
//                             >
//                               Cancel
//                             </Button>
//                           </>
//                         ) : (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="outline-secondary"
//                               onClick={() => startEdit(s.id, s.name)}
//                             >
//                               Edit
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               onClick={() => setConfirmDeleteId(s.id)}
//                             >
//                               Delete
//                             </Button>
//                           </>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//               )}
//             </tbody>
//           </Table>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center mt-3">
//         <Form.Select
//           value={perPage}
//           onChange={(e) => {
//             setPerPage(Number(e.target.value));
//             setPage(1);
//           }}
//           style={{ width: "140px" }}
//         >
//           <option value={5}>5 rows</option>
//           <option value={10}>10 rows</option>
//           <option value={20}>20 rows</option>
//           <option value={50}>50 rows</option>
//           <option value={100}>100 rows</option>
//         </Form.Select>

//         <Form.Control
//           placeholder="Search secteur..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="ms-4"
//           style={{ maxWidth: "400px" }}
//         />

//         {totalPages > 1 && (
//           <Pagination>
//             {[...Array(totalPages)].map((_, i) => (
//               <Pagination.Item
//                 key={i}
//                 active={page === i + 1}
//                 onClick={() => setPage(i + 1)}
//               >
//                 {i + 1}
//               </Pagination.Item>
//             ))}
//           </Pagination>
//         )}
//       </div>

//       {/* Confirm delete modal */}
//       <Modal
//         show={Boolean(confirmDeleteId)}
//         onHide={() => setConfirmDeleteId(null)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm deletion</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you sure you want to delete this secteur?</Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
//             Cancel
//           </Button>
//           <Button
//             variant="danger"
//             onClick={async () => {
//               await geoService.deleteSecteur(tenantSlug!, confirmDeleteId!);
//               setConfirmDeleteId(null);
//               fetchSecteurs();
//             }}
//           >
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default SecteurList;

// ====================================
// import React, { useEffect, useState } from "react";
// import { Table, Button, Form, Pagination } from "react-bootstrap";
// import { useParams } from "react-router-dom";
// import geoService from "../../services/geoService";

// const SecteurList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   // États principaux
//   const [secteurs, setSecteurs] = useState<any[]>([]); // liste des secteurs à afficher
//   const [regions, setRegions] = useState<any[]>([]); // pour filtrer par région
//   const [departements, setDepartements] = useState<any[]>([]); // pour filtrer par département
//   const [selectedRegion, setSelectedRegion] = useState("");
//   const [selectedDepartement, setSelectedDepartement] = useState("");
//   const [newName, setNewName] = useState(""); // nouveau secteur
//   const [editingId, setEditingId] = useState<string | null>(null); // secteur en édition
//   const [editName, setEditName] = useState(""); // nom temporaire en édition

//   // Pagination serveur
//   const [page, setPage] = useState(1);
//   const [perPage] = useState(10); // nombre d'éléments par page
//   const [total, setTotal] = useState(0); // total des secteurs pour pagination

//   // ⚡ Fetch des régions au chargement
//   const fetchRegions = async () => {
//     const res = await geoService.listRegions(tenantSlug!);
//     setRegions(res.data.data);
//   };

//   // ⚡ Fetch des départements selon région sélectionnée
//   const fetchDepartements = async () => {
//     if (!selectedRegion) {
//       setDepartements([]);
//       return;
//     }
//     const res = await geoService.listDepartements(tenantSlug!, {
//       regionId: selectedRegion,
//     });
//     setDepartements(res.data.data);
//   };

//   // ⚡ Fetch des secteurs selon région + département + pagination
//   const fetchSecteurs = async () => {
//     if (!selectedRegion || !selectedDepartement) return;
//     const res = await geoService.listSecteurs(tenantSlug!, {
//       regionId: selectedRegion,
//       departementId: selectedDepartement,
//       page,
//       perPage,
//     });
//     setSecteurs(res.data.data);
//     setTotal(res.data.meta.total);
//   };

//   // Effets React
//   useEffect(() => {
//     fetchRegions();
//   }, [tenantSlug]); // fetch régions au démarrage
//   useEffect(() => {
//     setSelectedDepartement("");
//     fetchDepartements();
//   }, [selectedRegion]); // reset départements quand région change
//   useEffect(() => {
//     setPage(1);
//   }, [selectedDepartement]); // reset page si département change
//   useEffect(() => {
//     fetchSecteurs();
//   }, [tenantSlug, selectedRegion, selectedDepartement, page]); // fetch secteurs

//   // Ajouter un nouveau secteur
//   const handleCreate = async () => {
//     if (!newName || !selectedDepartement) return;
//     await geoService.createSecteur(tenantSlug!, {
//       name: newName,
//       departementId: selectedDepartement,
//     });
//     setNewName("");
//     fetchSecteurs();
//   };

//   // Gestion de l'édition inline
//   const startEdit = (id: string, name: string) => {
//     setEditingId(id);
//     setEditName(name);
//   };
//   const saveEdit = async (id: string) => {
//     await geoService.updateSecteur(tenantSlug!, id, { name: editName });
//     setEditingId(null);
//     fetchSecteurs();
//   };
//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditName("");
//   };

//   // Supprimer un secteur
//   const deleteItem = async (id: string) => {
//     await geoService.deleteSecteur(tenantSlug!, id);
//     fetchSecteurs();
//   };

//   // Nombre total de pages pour pagination
//   const totalPages = Math.ceil(total / perPage);

//   return (
//     <div>
//       {/* Filtre par région */}
//       <Form.Select
//         className="mb-3"
//         value={selectedRegion}
//         onChange={(e) => setSelectedRegion(e.target.value)}
//       >
//         <option value="">-- Select Region --</option>
//         {regions.map((r) => (
//           <option key={r.id} value={r.id}>
//             {r.name}
//           </option>
//         ))}
//       </Form.Select>

//       {/* Filtre par département */}
//       {selectedRegion && (
//         <Form.Select
//           className="mb-3"
//           value={selectedDepartement}
//           onChange={(e) => setSelectedDepartement(e.target.value)}
//         >
//           <option value="">-- Select Departement --</option>
//           {departements.map((d) => (
//             <option key={d.id} value={d.id}>
//               {d.name}
//             </option>
//           ))}
//         </Form.Select>
//       )}

//       {/* Formulaire création secteur */}
//       {selectedDepartement && (
//         <Form className="d-flex gap-2 mb-3">
//           <Form.Control
//             placeholder="New secteur"
//             value={newName}
//             onChange={(e) => setNewName(e.target.value)}
//           />
//           <Button onClick={handleCreate}>Add</Button>
//         </Form>
//       )}

//       {/* Liste secteurs avec édition inline et suppression */}
//       <Table bordered hover responsive>
//         <thead>
//           <tr>
//             <th>Secteur</th>
//             <th style={{ width: "200px" }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {secteurs.map((s) => (
//             <tr key={s.id}>
//               <td>
//                 {editingId === s.id ? (
//                   <Form.Control
//                     value={editName}
//                     onChange={(e) => setEditName(e.target.value)}
//                     autoFocus
//                   />
//                 ) : (
//                   s.name
//                 )}
//               </td>
//               <td className="d-flex gap-2">
//                 {editingId === s.id ? (
//                   <>
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => saveEdit(s.id)}
//                     >
//                       Save
//                     </Button>
//                     <Button variant="secondary" size="sm" onClick={cancelEdit}>
//                       Cancel
//                     </Button>
//                   </>
//                 ) : (
//                   <>
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => startEdit(s.id, s.name)}
//                     >
//                       Update
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => deleteItem(s.id)}
//                     >
//                       Delete
//                     </Button>
//                   </>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       {/* Pagination serveur */}
//       {totalPages > 1 && (
//         <Pagination>
//           {[...Array(totalPages)].map((_, i) => (
//             <Pagination.Item
//               key={i}
//               active={i + 1 === page}
//               onClick={() => setPage(i + 1)}
//             >
//               {i + 1}
//             </Pagination.Item>
//           ))}
//         </Pagination>
//       )}
//     </div>
//   );
// };

// export default SecteurList;
