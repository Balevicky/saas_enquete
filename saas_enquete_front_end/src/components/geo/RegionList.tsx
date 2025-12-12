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

const RegionList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  const [regions, setRegions] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [total, setTotal] = useState(0);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRegions = async () => {
    if (!tenantSlug) return;

    setLoading(true);

    const res = await geoService.listRegions(tenantSlug);
    let list = res.data.data;

    if (search.trim() !== "") {
      list = list.filter((r: any) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setRegions(list);
    setTotal(list.length);

    setLoading(false);
  };

  useEffect(() => {
    fetchRegions();
  }, [tenantSlug]);

  useEffect(() => {
    fetchRegions();
  }, [page, search, perPage]);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    await geoService.createRegion(tenantSlug!, newName);
    setNewName("");
    fetchRegions();
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;

    await geoService.updateRegion(tenantSlug!, id, { name: editName });
    setEditingId(null);
    fetchRegions();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="mb-3 fw-semibold">Manage Regions</h3>

          <Form className="row g-3 align-items-end">
            {/* New Region */}
            <div className="col-md-6">
              <Form.Label className="fw-medium">New region</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            {/* Add Button */}
            <div className="col-md-6 d-grid">
              <Button
                variant="primary"
                className="fw-semibold py-2"
                onClick={handleCreate}
              >
                + Add
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Table wrapper */}
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
                <th>Region Name</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {regions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">
                    No regions found
                  </td>
                </tr>
              ) : (
                regions
                  .slice((page - 1) * perPage, page * perPage)
                  .map((r, index) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{index + 1}</strong>
                      </td>

                      <td>
                        {editingId === r.id ? (
                          <Form.Control
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <strong>{r.name}</strong>
                        )}
                      </td>

                      <td className="d-flex gap-2">
                        {editingId === r.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => saveEdit(r.id)}
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
                              onClick={() => startEdit(r.id, r.name)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setConfirmDeleteId(r.id)}
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

      {/* Pagination + rows selector + search */}
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
          placeholder="Search region..."
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

      {/* Delete confirmation modal */}
      <Modal
        show={Boolean(confirmDeleteId)}
        onHide={() => setConfirmDeleteId(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this region?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await geoService.deleteRegion(tenantSlug!, confirmDeleteId!);
              setConfirmDeleteId(null);
              fetchRegions();
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RegionList;

// ===================================== bon mais ancien
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

// const RegionList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   const [regions, setRegions] = useState<any[]>([]);
//   const [newName, setNewName] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editName, setEditName] = useState("");

//   const [page, setPage] = useState(1);
//   const [perPage, setPerPage] = useState(5); // ⬅️ rendu dynamique ici
//   const [total, setTotal] = useState(0);

//   const [loading, setLoading] = useState(true);
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
//   const [search, setSearch] = useState("");

//   const fetchRegions = async () => {
//     if (!tenantSlug) return;
//     setLoading(true);

//     const res = await geoService.listRegions(tenantSlug);
//     let list = res.data.data;

//     if (search.trim() !== "") {
//       list = list.filter((r: any) =>
//         r.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     setRegions(list);
//     setTotal(list.length);

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchRegions();
//   }, [tenantSlug, page, search, perPage]); // ⬅️ refresh si perPage change

//   const handleCreate = async () => {
//     if (!newName.trim()) return;
//     await geoService.createRegion(tenantSlug!, newName);
//     setNewName("");
//     fetchRegions();
//   };

//   const startEdit = (id: string, name: string) => {
//     setEditingId(id);
//     setEditName(name);
//   };

//   const saveEdit = async (id: string) => {
//     if (!editName.trim()) return;
//     await geoService.updateRegion(tenantSlug!, id, { name: editName });
//     setEditingId(null);
//     fetchRegions();
//   };

//   const deleteRegion = async () => {
//     if (!confirmDeleteId) return;
//     await geoService.deleteRegion(tenantSlug!, confirmDeleteId);
//     setConfirmDeleteId(null);
//     fetchRegions();
//   };

//   const totalPages = Math.ceil(total / perPage);

//   return (
//     <div className="p-3">
//       {/* Header / Actions */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         {/* <h3 className="m-0">Regions</h3> */}

//         <Form className="d-flex gap-2">
//           <Form.Control
//             placeholder="Search region..."
//             style={{ minWidth: "220px" }}
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <Form.Control
//             placeholder="New region"
//             value={newName}
//             onChange={(e) => setNewName(e.target.value)}
//           />

//           <Button variant="primary" onClick={handleCreate}>
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
//                 <th>Region Name</th>
//                 <th style={{ width: "160px" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {regions.length === 0 ? (
//                 <tr>
//                   <td colSpan={2} className="text-center py-4 text-muted">
//                     No regions found
//                   </td>
//                 </tr>
//               ) : (
//                 regions.slice((page - 1) * perPage, page * perPage).map((r) => (
//                   <tr key={r.id}>
//                     <td>
//                       {editingId === r.id ? (
//                         <Form.Control
//                           value={editName}
//                           onChange={(e) => setEditName(e.target.value)}
//                           autoFocus
//                         />
//                       ) : (
//                         <strong>{r.name}</strong>
//                       )}
//                     </td>

//                     <td className="d-flex gap-2">
//                       {editingId === r.id ? (
//                         <>
//                           <Button
//                             size="sm"
//                             variant="success"
//                             onClick={() => saveEdit(r.id)}
//                           >
//                             Save
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="secondary"
//                             onClick={() => setEditingId(null)}
//                           >
//                             Cancel
//                           </Button>
//                         </>
//                       ) : (
//                         <>
//                           <Button
//                             size="sm"
//                             variant="outline-secondary"
//                             onClick={() => startEdit(r.id, r.name)}
//                           >
//                             Edit
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline-danger"
//                             onClick={() => setConfirmDeleteId(r.id)}
//                           >
//                             Delete
//                           </Button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </Table>
//         )}
//       </div>

//       {/* Pagination + rows per page */}
//       <div className="d-flex justify-content-between align-items-center mt-3">
//         {/* Sélecteur lignes par page */}
//         <Form.Select
//           value={perPage}
//           onChange={(e) => {
//             setPerPage(Number(e.target.value));
//             setPage(1); // reset pagination
//           }}
//           style={{ width: "140px" }}
//         >
//           <option value={5}>5 rows</option>
//           <option value={10}>10 rows</option>
//           <option value={20}>20 rows</option>
//           <option value={50}>50 rows</option>
//           <option value={100}>100 rows</option>
//         </Form.Select>

//         {/* Pagination */}
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

//       {/* Delete Confirmation Dialog */}
//       <Modal
//         show={Boolean(confirmDeleteId)}
//         onHide={() => setConfirmDeleteId(null)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm deletion</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you sure you want to delete this region?</Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={deleteRegion}>
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default RegionList;

// ====================================================
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

// const RegionList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   const [regions, setRegions] = useState<any[]>([]);
//   const [newName, setNewName] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editName, setEditName] = useState("");

//   const [page, setPage] = useState(1);
//   const perPage = 5;
//   const [total, setTotal] = useState(0);

//   const [loading, setLoading] = useState(true);
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
//   const [search, setSearch] = useState("");

//   const fetchRegions = async () => {
//     if (!tenantSlug) return;
//     setLoading(true);

//     const res = await geoService.listRegions(tenantSlug);
//     let list = res.data.data;

//     // Filtre recherche UI côté front (si ton backend ne supporte pas encore /?search=)
//     if (search.trim() !== "") {
//       list = list.filter((r: any) =>
//         r.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     setRegions(list);
//     setTotal(list.length);

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchRegions();
//   }, [tenantSlug, page, search]);

//   const handleCreate = async () => {
//     if (!newName.trim()) return;
//     await geoService.createRegion(tenantSlug!, newName);
//     setNewName("");
//     fetchRegions();
//   };

//   const startEdit = (id: string, name: string) => {
//     setEditingId(id);
//     setEditName(name);
//   };

//   const saveEdit = async (id: string) => {
//     if (!editName.trim()) return;
//     await geoService.updateRegion(tenantSlug!, id, { name: editName });
//     setEditingId(null);
//     fetchRegions();
//   };

//   const deleteRegion = async () => {
//     if (!confirmDeleteId) return;
//     await geoService.deleteRegion(tenantSlug!, confirmDeleteId);
//     setConfirmDeleteId(null);
//     fetchRegions();
//   };

//   const totalPages = Math.ceil(total / perPage);

//   return (
//     <div className="p-3">
//       {/* Header / Actions */}
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h3 className="m-0">Regions</h3>

//         <Form className="d-flex gap-2">
//           <Form.Control
//             placeholder="Search region..."
//             style={{ minWidth: "220px" }}
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <Form.Control
//             placeholder="New region"
//             value={newName}
//             onChange={(e) => setNewName(e.target.value)}
//           />

//           <Button variant="primary" onClick={handleCreate}>
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
//                 <th>Region Name</th>
//                 <th style={{ width: "160px" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {regions.length === 0 ? (
//                 <tr>
//                   <td colSpan={2} className="text-center py-4 text-muted">
//                     No regions found
//                   </td>
//                 </tr>
//               ) : (
//                 regions.slice((page - 1) * perPage, page * perPage).map((r) => (
//                   <tr key={r.id}>
//                     <td>
//                       {editingId === r.id ? (
//                         <Form.Control
//                           value={editName}
//                           onChange={(e) => setEditName(e.target.value)}
//                           autoFocus
//                         />
//                       ) : (
//                         <strong>{r.name}</strong>
//                       )}
//                     </td>

//                     <td className="d-flex gap-2">
//                       {editingId === r.id ? (
//                         <>
//                           <Button
//                             size="sm"
//                             variant="success"
//                             onClick={() => saveEdit(r.id)}
//                           >
//                             Save
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="secondary"
//                             onClick={() => setEditingId(null)}
//                           >
//                             Cancel
//                           </Button>
//                         </>
//                       ) : (
//                         <>
//                           <Button
//                             size="sm"
//                             variant="outline-secondary"
//                             onClick={() => startEdit(r.id, r.name)}
//                           >
//                             Edit
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline-danger"
//                             onClick={() => setConfirmDeleteId(r.id)}
//                           >
//                             Delete
//                           </Button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </Table>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <Pagination className="mt-3">
//           {[...Array(totalPages)].map((_, i) => (
//             <Pagination.Item
//               key={i}
//               active={page === i + 1}
//               onClick={() => setPage(i + 1)}
//             >
//               {i + 1}
//             </Pagination.Item>
//           ))}
//         </Pagination>
//       )}

//       {/* Delete Confirmation Dialog */}
//       <Modal
//         show={Boolean(confirmDeleteId)}
//         onHide={() => setConfirmDeleteId(null)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm deletion</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you sure you want to delete this region?</Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={deleteRegion}>
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default RegionList;

// ====================================
// import React, { useEffect, useState } from "react";
// import { Table, Button, Form, Pagination } from "react-bootstrap";
// import { useParams } from "react-router-dom";
// import geoService from "../../services/geoService";

// const RegionList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();

//   // États principaux
//   const [regions, setRegions] = useState<any[]>([]); // Liste des régions à afficher
//   const [newName, setNewName] = useState(""); // Nouveau nom de région
//   const [editingId, setEditingId] = useState<string | null>(null); // Région en édition
//   const [editName, setEditName] = useState(""); // Nom temporaire pour édition

//   // Pagination serveur
//   const [page, setPage] = useState(1); // page courante
//   const [perPage] = useState(10); // éléments par page
//   const [total, setTotal] = useState(0); // total des régions pour pagination

//   // ⚡ Fetch des régions avec pagination
//   const fetchRegions = async () => {
//     if (!tenantSlug) return;

//     // Appel au backend avec page/perPage
//     const res = await geoService.listRegions(tenantSlug);

//     // Si ton backend supporte pagination via query params, tu peux faire :
//     // const res = await geoService.listRegions(tenantSlug, { page, perPage });

//     // On met à jour l'état
//     setRegions(res.data.data);
//     setTotal(res.data.meta?.total || res.data.data.length); // fallback si meta absent
//   };

//   // Effet React pour fetch régions à chaque changement de page
//   useEffect(() => {
//     fetchRegions();
//   }, [tenantSlug, page]);

//   // Ajouter une nouvelle région
//   const handleCreate = async () => {
//     if (!newName) return;
//     await geoService.createRegion(tenantSlug!, newName);
//     setNewName("");
//     fetchRegions();
//   };

//   // Commencer l'édition inline
//   const startEdit = (id: string, name: string) => {
//     setEditingId(id);
//     setEditName(name);
//   };

//   // Sauvegarder édition
//   const saveEdit = async (id: string) => {
//     await geoService.updateRegion(tenantSlug!, id, { name: editName });
//     setEditingId(null);
//     fetchRegions();
//   };

//   // Annuler édition
//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditName("");
//   };

//   // Supprimer une région
//   const deleteItem = async (id: string) => {
//     await geoService.deleteRegion(tenantSlug!, id);
//     fetchRegions();
//   };

//   // Calcul du nombre total de pages
//   const totalPages = Math.ceil(total / perPage);

//   return (
//     <div>
//       {/* Formulaire ajout région */}
//       <Form className="d-flex gap-2 mb-3">
//         <Form.Control
//           placeholder="New region"
//           value={newName}
//           onChange={(e) => setNewName(e.target.value)}
//         />
//         <Button onClick={handleCreate}>Add</Button>
//       </Form>

//       {/* Tableau des régions */}
//       <Table bordered hover responsive>
//         <thead>
//           <tr>
//             <th>Region</th>
//             <th style={{ width: "200px" }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {regions.map((r) => (
//             <tr key={r.id}>
//               <td>
//                 {editingId === r.id ? (
//                   <Form.Control
//                     value={editName}
//                     onChange={(e) => setEditName(e.target.value)}
//                     autoFocus
//                   />
//                 ) : (
//                   r.name
//                 )}
//               </td>
//               <td className="d-flex gap-2">
//                 {editingId === r.id ? (
//                   <>
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => saveEdit(r.id)}
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
//                       size="sm"
//                       variant="secondary"
//                       onClick={() => startEdit(r.id, r.name)}
//                     >
//                       Update
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="danger"
//                       onClick={() => deleteItem(r.id)}
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

// export default RegionList;
