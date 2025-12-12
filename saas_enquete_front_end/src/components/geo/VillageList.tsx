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

const VillageList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

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

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useState(""); // ✅ search added

  // LOADERS
  const fetchRegions = async () => {
    const res = await geoService.listRegions(tenantSlug!);
    setRegions(res.data.data);
  };

  const fetchDepartements = async () => {
    if (!selectedRegion) return setDepartements([]);
    const res = await geoService.listDepartements(tenantSlug!, {
      regionId: selectedRegion,
    });
    setDepartements(res.data.data);
  };

  const fetchSecteurs = async () => {
    if (!selectedDepartement) return setSecteurs([]);
    const res = await geoService.listSecteurs(tenantSlug!, {
      departementId: selectedDepartement,
    });
    setSecteurs(res.data.data);
  };

  const fetchVillages = async () => {
    if (!selectedSecteur) return;

    setLoading(true);

    const res = await geoService.listVillages(tenantSlug!, {
      secteurId: selectedSecteur,
    });

    let list = res.data.data;

    // ✅ Apply search filter (same logic as DepartementList)
    if (search.trim() !== "") {
      list = list.filter((v: any) =>
        v.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setVillages(list);
    setTotal(list.length);

    setLoading(false);
  };

  useEffect(() => {
    fetchRegions();
  }, [tenantSlug]);

  useEffect(() => {
    setSelectedDepartement("");
    setSelectedSecteur("");
    fetchDepartements();
  }, [selectedRegion]);

  useEffect(() => {
    setSelectedSecteur("");
    fetchSecteurs();
  }, [selectedDepartement]);

  useEffect(() => {
    setPage(1);
    fetchVillages();
  }, [selectedSecteur]);

  useEffect(() => {
    fetchVillages();
  }, [page, perPage, search]); // ✅ triggers search

  // CRUD
  const handleCreate = async () => {
    if (!newName || !selectedSecteur) return;
    await geoService.createVillage(tenantSlug!, {
      name: newName,
      secteurId: selectedSecteur,
    });
    setNewName("");
    fetchVillages();
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = async (id: string) => {
    await geoService.updateVillage(tenantSlug!, id, { name: editName });
    setEditingId(null);
    fetchVillages();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-3">
      {/* HEADER CARD */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="mb-3 fw-semibold">Manage Villages</h3>

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

            {/* Secteur */}
            <div className="col-md-4">
              <Form.Label className="fw-medium">Secteur</Form.Label>
              <Form.Select
                value={selectedSecteur}
                onChange={(e) => setSelectedSecteur(e.target.value)}
                disabled={!selectedDepartement}
              >
                <option value="">Select secteur...</option>
                {secteurs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* New village */}
            {selectedSecteur && (
              <>
                <div className="col-md-8">
                  <Form.Label className="fw-medium">New village</Form.Label>
                  <Form.Control
                    placeholder="Enter name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                <div className="col-md-4 d-grid">
                  <Button
                    variant="primary"
                    className="fw-semibold py-2"
                    onClick={handleCreate}
                  >
                    + Add
                  </Button>
                </div>
              </>
            )}
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
                <th style={{ width: "30px" }}>N°</th>
                <th>Village</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {villages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">
                    No villages found
                  </td>
                </tr>
              ) : (
                villages
                  .slice((page - 1) * perPage, page * perPage)
                  .map((v, index) => (
                    <tr key={v.id}>
                      <td>
                        <strong>{index + 1}</strong>
                      </td>
                      <td>
                        {editingId === v.id ? (
                          <Form.Control
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <strong>{v.name}</strong>
                        )}
                      </td>

                      <td className="d-flex gap-2">
                        {editingId === v.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => saveEdit(v.id)}
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
                              onClick={() => startEdit(v.id, v.name)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setConfirmDeleteId(v.id)}
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

      {/* FOOTER PAGINATION + SEARCH (identique à DepartementList) */}
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
          </Form.Select>
        </InputGroup>

        {/* ✅ Search village added */}
        <Form.Control
          placeholder="Search village..."
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

      {/* DELETE MODAL */}
      <Modal
        show={Boolean(confirmDeleteId)}
        onHide={() => setConfirmDeleteId(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>

        <Modal.Body>Are you sure you want to delete this village?</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={async () => {
              await geoService.deleteVillage(tenantSlug!, confirmDeleteId!);
              setConfirmDeleteId(null);
              fetchVillages();
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VillageList;

// ====================================================== bon mais manque le champs de recherche
// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Button,
//   Form,
//   Pagination,
//   Spinner,
//   Modal,
//   InputGroup,
// } from "react-bootstrap";
// import { useParams } from "react-router-dom";
// import geoService from "../../services/geoService";

// const VillageList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   const [villages, setVillages] = useState<any[]>([]);
//   const [regions, setRegions] = useState<any[]>([]);
//   const [departements, setDepartements] = useState<any[]>([]);
//   const [secteurs, setSecteurs] = useState<any[]>([]);

//   const [selectedRegion, setSelectedRegion] = useState("");
//   const [selectedDepartement, setSelectedDepartement] = useState("");
//   const [selectedSecteur, setSelectedSecteur] = useState("");

//   const [newName, setNewName] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editName, setEditName] = useState("");

//   const [page, setPage] = useState(1);
//   const [perPage, setPerPage] = useState(5);
//   const [total, setTotal] = useState(0);

//   const [loading, setLoading] = useState(false);
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

//   // LOADERS
//   const fetchRegions = async () => {
//     const res = await geoService.listRegions(tenantSlug!);
//     setRegions(res.data.data);
//   };

//   const fetchDepartements = async () => {
//     if (!selectedRegion) return setDepartements([]);
//     const res = await geoService.listDepartements(tenantSlug!, {
//       regionId: selectedRegion,
//     });
//     setDepartements(res.data.data);
//   };

//   const fetchSecteurs = async () => {
//     if (!selectedDepartement) return setSecteurs([]);
//     const res = await geoService.listSecteurs(tenantSlug!, {
//       departementId: selectedDepartement,
//     });
//     setSecteurs(res.data.data);
//   };

//   const fetchVillages = async () => {
//     if (!selectedSecteur) return;
//     setLoading(true);
//     const res = await geoService.listVillages(tenantSlug!, {
//       secteurId: selectedSecteur,
//     });
//     setVillages(res.data.data);
//     setTotal(res.data.data.length);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchRegions();
//   }, [tenantSlug]);

//   useEffect(() => {
//     setSelectedDepartement("");
//     setSelectedSecteur("");
//     fetchDepartements();
//   }, [selectedRegion]);

//   useEffect(() => {
//     setSelectedSecteur("");
//     fetchSecteurs();
//   }, [selectedDepartement]);

//   useEffect(() => {
//     setPage(1);
//     fetchVillages();
//   }, [selectedSecteur]);

//   useEffect(() => {
//     fetchVillages();
//   }, [page, perPage]);

//   // CRUD
//   const handleCreate = async () => {
//     if (!newName || !selectedSecteur) return;
//     await geoService.createVillage(tenantSlug!, {
//       name: newName,
//       secteurId: selectedSecteur,
//     });
//     setNewName("");
//     fetchVillages();
//   };

//   const startEdit = (id: string, name: string) => {
//     setEditingId(id);
//     setEditName(name);
//   };

//   const saveEdit = async (id: string) => {
//     await geoService.updateVillage(tenantSlug!, id, { name: editName });
//     setEditingId(null);
//     fetchVillages();
//   };

//   const totalPages = Math.ceil(total / perPage);

//   return (
//     <div className="p-3">
//       {/* HEADER CARD */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body">
//           <h3 className="mb-3 fw-semibold">Manage Villages</h3>

//           <Form className="row g-3 align-items-end">
//             {/* Region */}
//             <div className="col-md-4">
//               <Form.Label className="fw-medium">Region</Form.Label>
//               <Form.Select
//                 value={selectedRegion}
//                 onChange={(e) => setSelectedRegion(e.target.value)}
//               >
//                 <option value="">Select region...</option>
//                 {regions.map((r) => (
//                   <option key={r.id} value={r.id}>
//                     {r.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </div>

//             {/* Departement */}
//             <div className="col-md-4">
//               <Form.Label className="fw-medium">Departement</Form.Label>
//               <Form.Select
//                 value={selectedDepartement}
//                 onChange={(e) => setSelectedDepartement(e.target.value)}
//                 disabled={!selectedRegion}
//               >
//                 <option value="">Select departement...</option>
//                 {departements.map((d) => (
//                   <option key={d.id} value={d.id}>
//                     {d.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </div>

//             {/* Secteur */}
//             <div className="col-md-4">
//               <Form.Label className="fw-medium">Secteur</Form.Label>
//               <Form.Select
//                 value={selectedSecteur}
//                 onChange={(e) => setSelectedSecteur(e.target.value)}
//                 disabled={!selectedDepartement}
//               >
//                 <option value="">Select secteur...</option>
//                 {secteurs.map((s) => (
//                   <option key={s.id} value={s.id}>
//                     {s.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </div>

//             {/* New village */}
//             {selectedSecteur && (
//               <>
//                 <div className="col-md-8">
//                   <Form.Label className="fw-medium">New village</Form.Label>
//                   <Form.Control
//                     placeholder="Enter name"
//                     value={newName}
//                     onChange={(e) => setNewName(e.target.value)}
//                   />
//                 </div>

//                 <div className="col-md-4 d-grid">
//                   <Button
//                     variant="primary"
//                     className="fw-semibold py-2"
//                     onClick={handleCreate}
//                   >
//                     + Add
//                   </Button>
//                 </div>
//               </>
//             )}
//           </Form>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="border rounded shadow-sm">
//         {loading ? (
//           <div className="text-center p-5">
//             <Spinner animation="border" />
//           </div>
//         ) : (
//           <Table
//             responsive
//             hover
//             bordered
//             striped
//             className="m-0 table-bordered table-striped"
//           >
//             <thead className="table-dark">
//               <tr>
//                 <th style={{ width: "30px" }}>N°</th>
//                 <th>Village</th>
//                 <th style={{ width: "160px" }}>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {villages.length === 0 ? (
//                 <tr>
//                   <td colSpan={3} className="text-center py-4 text-muted">
//                     No villages found
//                   </td>
//                 </tr>
//               ) : (
//                 villages
//                   .slice((page - 1) * perPage, page * perPage)
//                   .map((v, index) => (
//                     <tr key={v.id}>
//                       <td>
//                         <strong>{index + 1}</strong>
//                       </td>
//                       <td>
//                         {editingId === v.id ? (
//                           <Form.Control
//                             value={editName}
//                             onChange={(e) => setEditName(e.target.value)}
//                             autoFocus
//                           />
//                         ) : (
//                           <strong>{v.name}</strong>
//                         )}
//                       </td>

//                       <td className="d-flex gap-2">
//                         {editingId === v.id ? (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="success"
//                               onClick={() => saveEdit(v.id)}
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
//                               onClick={() => startEdit(v.id, v.name)}
//                             >
//                               Edit
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               onClick={() => setConfirmDeleteId(v.id)}
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

//       {/* FOOTER PAGINATION */}
//       <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
//         <InputGroup style={{ maxWidth: "200px" }}>
//           <Form.Select
//             value={perPage}
//             onChange={(e) => {
//               setPerPage(Number(e.target.value));
//               setPage(1);
//             }}
//           >
//             <option value={5}>5 rows</option>
//             <option value={10}>10 rows</option>
//             <option value={20}>20 rows</option>
//             <option value={50}>50 rows</option>
//           </Form.Select>
//         </InputGroup>

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

//       {/* DELETE MODAL */}
//       <Modal
//         show={Boolean(confirmDeleteId)}
//         onHide={() => setConfirmDeleteId(null)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm deletion</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>Are you sure you want to delete this village?</Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
//             Cancel
//           </Button>

//           <Button
//             variant="danger"
//             onClick={async () => {
//               await geoService.deleteVillage(tenantSlug!, confirmDeleteId!);
//               setConfirmDeleteId(null);
//               fetchVillages();
//             }}
//           >
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default VillageList;

// ===========================================
// import React, { useEffect, useState } from "react";
// import { Table, Button, Form, Pagination } from "react-bootstrap";
// import { useParams } from "react-router-dom";
// import geoService from "../../services/geoService";

// const VillageList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   // États principaux
//   const [villages, setVillages] = useState<any[]>([]);
//   const [regions, setRegions] = useState<any[]>([]);
//   const [departements, setDepartements] = useState<any[]>([]);
//   const [secteurs, setSecteurs] = useState<any[]>([]);

//   const [selectedRegion, setSelectedRegion] = useState("");
//   const [selectedDepartement, setSelectedDepartement] = useState("");
//   const [selectedSecteur, setSelectedSecteur] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editName, setEditName] = useState("");

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [perPage] = useState(10);
//   const [total, setTotal] = useState(0);

//   // ⚡ Fetch régions
//   const fetchRegions = async () => {
//     const res = await geoService.listRegions(tenantSlug!);
//     setRegions(res.data.data);
//   };

//   // ⚡ Fetch départements selon région
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

//   // ⚡ Fetch secteurs selon département
//   const fetchSecteurs = async () => {
//     if (!selectedDepartement) {
//       setSecteurs([]);
//       return;
//     }
//     const res = await geoService.listSecteurs(tenantSlug!, {
//       departementId: selectedDepartement,
//     });
//     setSecteurs(res.data.data);
//   };

//   // ⚡ Fetch villages avec pagination
//   const fetchVillages = async () => {
//     if (!selectedSecteur) return;
//     const res = await geoService.listVillages(tenantSlug!, {
//       secteurId: selectedSecteur,
//       page,
//       perPage,
//     });
//     setVillages(res.data.data);
//     setTotal(res.data.meta.total);
//   };

//   // Effets
//   useEffect(() => {
//     fetchRegions();
//   }, [tenantSlug]);
//   useEffect(() => {
//     setSelectedDepartement("");
//     fetchDepartements();
//   }, [selectedRegion]);
//   useEffect(() => {
//     setSelectedSecteur("");
//     fetchSecteurs();
//   }, [selectedDepartement]);
//   useEffect(() => {
//     setPage(1);
//   }, [selectedSecteur]);
//   useEffect(() => {
//     fetchVillages();
//   }, [tenantSlug, selectedRegion, selectedDepartement, selectedSecteur, page]);

//   // Ajouter village
//   const handleCreate = async () => {
//     if (!newName || !selectedSecteur) return;
//     await geoService.createVillage(tenantSlug!, {
//       name: newName,
//       secteurId: selectedSecteur,
//     });
//     setNewName("");
//     fetchVillages();
//   };

//   // Edition inline
//   const startEdit = (id: string, name: string) => {
//     setEditingId(id);
//     setEditName(name);
//   };
//   const saveEdit = async (id: string) => {
//     await geoService.updateVillage(tenantSlug!, id, { name: editName });
//     setEditingId(null);
//     fetchVillages();
//   };
//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditName("");
//   };

//   // Delete
//   const deleteItem = async (id: string) => {
//     await geoService.deleteVillage(tenantSlug!, id);
//     fetchVillages();
//   };

//   const totalPages = Math.ceil(total / perPage);

//   return (
//     <div>
//       {/* Filtre par région, département, secteur */}
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

//       {selectedSecteur && (
//         <Form.Select
//           className="mb-3"
//           value={selectedSecteur}
//           onChange={(e) => setSelectedSecteur(e.target.value)}
//         >
//           <option value="">-- Select Secteur --</option>
//           {secteurs.map((s) => (
//             <option key={s.id} value={s.id}>
//               {s.name}
//             </option>
//           ))}
//         </Form.Select>
//       )}

//       {/* Formulaire création */}
//       {selectedSecteur && (
//         <Form className="d-flex gap-2 mb-3">
//           <Form.Control
//             placeholder="New village"
//             value={newName}
//             onChange={(e) => setNewName(e.target.value)}
//           />
//           <Button onClick={handleCreate}>Add</Button>
//         </Form>
//       )}

//       {/* Liste villages */}
//       <Table bordered hover responsive>
//         <thead>
//           <tr>
//             <th>Village</th>
//             <th style={{ width: "200px" }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {villages.map((v) => (
//             <tr key={v.id}>
//               <td>
//                 {editingId === v.id ? (
//                   <Form.Control
//                     value={editName}
//                     onChange={(e) => setEditName(e.target.value)}
//                     autoFocus
//                   />
//                 ) : (
//                   v.name
//                 )}
//               </td>
//               <td className="d-flex gap-2">
//                 {editingId === v.id ? (
//                   <>
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => saveEdit(v.id)}
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
//                       onClick={() => startEdit(v.id, v.name)}
//                     >
//                       Update
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => deleteItem(v.id)}
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

//       {/* Pagination */}
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

// export default VillageList;
