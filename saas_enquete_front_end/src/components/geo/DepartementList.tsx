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

const DepartementList: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  const [departements, setDepartements] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5); // dynamique comme Regions
  const [total, setTotal] = useState(0);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Load regions
  const fetchRegions = async () => {
    const res = await geoService.listRegions(tenantSlug!);
    setRegions(res.data.data);
  };

  // Load departements
  const fetchDepartements = async () => {
    if (!selectedRegion) return;

    setLoading(true);

    const res = await geoService.listDepartements(tenantSlug!, {
      regionId: selectedRegion,
    });

    let list = res.data.data;

    // Search filter UI
    if (search.trim() !== "") {
      list = list.filter((d: any) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setDepartements(list);
    setTotal(list.length);

    setLoading(false);
  };

  useEffect(() => {
    fetchRegions();
  }, [tenantSlug]);

  useEffect(() => {
    setPage(1);
    fetchDepartements();
  }, [selectedRegion]);

  useEffect(() => {
    fetchDepartements();
  }, [page, search, perPage]);

  const handleCreate = async () => {
    if (!newName.trim() || !selectedRegion) return;

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

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="mb-3 fw-semibold">Manage Departements</h3>

          <Form className="row g-3 align-items-end">
            {/* Region Select */}
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

            {/* New Departement */}
            <div className="col-md-4">
              <Form.Label className="fw-medium">New departement</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            {/* Add Button */}
            <div className="col-md-4 d-grid">
              <Button
                variant="primary"
                className="fw-semibold py-2"
                onClick={handleCreate}
                disabled={!selectedRegion}
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
          // <Table responsive hover className="m-0">
          <Table
            responsive
            hover
            bordered
            striped
            className="m-0 table-bordered table-striped"
          >
            <thead className="table-dark">
              {/* <thead className="table-light"> */}
              <tr>
                <th style={{ width: "30px" }}>N°</th>
                <th>Departement</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {departements.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-muted">
                    No departements found
                  </td>
                </tr>
              ) : (
                departements
                  .slice((page - 1) * perPage, page * perPage)
                  .map((d, index) => (
                    <tr key={d.id}>
                      <td>
                        <strong>{index + 1}</strong>
                      </td>
                      <td>
                        {editingId === d.id ? (
                          <Form.Control
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <strong>{d.name}</strong>
                        )}
                      </td>

                      <td className="d-flex gap-2">
                        {editingId === d.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => saveEdit(d.id)}
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
                              onClick={() => startEdit(d.id, d.name)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setConfirmDeleteId(d.id)}
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
      {/* Pagination + rows selector */}
      {/* <div className="d-flex justify-content-between align-items-center mt-3">
        <Form.Select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1);
          }}
          style={{ width: "140px" }}
        >
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
          <option value={20}>20 rows</option>
          <option value={50}>50 rows</option>
          <option value={100}>100 rows</option>
        </Form.Select>
        <Form.Control
          placeholder="Search departement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ms-4"
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
      </div> */}
      {/* ===================================== */}
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
          placeholder="Search departement..."
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
      {/* ===================================== */}

      {/* Confirm delete modal */}
      <Modal
        show={Boolean(confirmDeleteId)}
        onHide={() => setConfirmDeleteId(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this departement?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await geoService.deleteDepartement(tenantSlug!, confirmDeleteId!);
              setConfirmDeleteId(null);
              fetchDepartements();
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DepartementList;

// =================================================
// import React, { useEffect, useState } from "react";
// import { Table, Button, Form, Pagination } from "react-bootstrap";
// import { useParams } from "react-router-dom";
// import geoService from "../../services/geoService";

// const DepartementList: React.FC = () => {
//   const { tenantSlug } = useParams<{ tenantSlug: string }>();
//   const [departements, setDepartements] = useState<any[]>([]);
//   const [regions, setRegions] = useState<any[]>([]);
//   const [selectedRegion, setSelectedRegion] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editName, setEditName] = useState("");

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [perPage] = useState(10);
//   const [total, setTotal] = useState(0);

//   const fetchRegions = async () => {
//     const res = await geoService.listRegions(tenantSlug!);
//     setRegions(res.data.data);
//   };

//   const fetchDepartements = async () => {
//     if (!selectedRegion) return;
//     const res = await geoService.listDepartements(tenantSlug!, {
//       regionId: selectedRegion,
//       page,
//       perPage,
//     });
//     setDepartements(res.data.data);
//     setTotal(res.data.meta.total);
//   };

//   useEffect(() => {
//     fetchRegions();
//   }, [tenantSlug]);

//   useEffect(() => {
//     setPage(1);
//   }, [selectedRegion]);

//   useEffect(() => {
//     fetchDepartements();
//   }, [tenantSlug, selectedRegion, page]);

//   const handleCreate = async () => {
//     if (!newName || !selectedRegion) return;
//     await geoService.createDepartement(tenantSlug!, {
//       name: newName,
//       regionId: selectedRegion,
//     });
//     setNewName("");
//     fetchDepartements();
//   };

//   const startEdit = (id: string, name: string) => {
//     setEditingId(id);
//     setEditName(name);
//   };

//   const saveEdit = async (id: string) => {
//     await geoService.updateDepartement(tenantSlug!, id, { name: editName });
//     setEditingId(null);
//     fetchDepartements();
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditName("");
//   };

//   const deleteItem = async (id: string) => {
//     await geoService.deleteDepartement(tenantSlug!, id);
//     fetchDepartements();
//   };

//   const totalPages = Math.ceil(total / perPage);

//   return (
//     <div>
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
//         <Form className="d-flex gap-2 mb-3">
//           <Form.Control
//             placeholder="New departement"
//             value={newName}
//             onChange={(e) => setNewName(e.target.value)}
//           />
//           <Button onClick={handleCreate}>Add</Button>
//         </Form>
//       )}

//       <Table bordered hover responsive>
//         <thead>
//           <tr>
//             <th>Departement</th>
//             <th style={{ width: "200px" }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {departements.map((d) => (
//             <tr key={d.id}>
//               <td>
//                 {editingId === d.id ? (
//                   <Form.Control
//                     value={editName}
//                     onChange={(e) => setEditName(e.target.value)}
//                     autoFocus
//                   />
//                 ) : (
//                   d.name
//                 )}
//               </td>
//               <td className="d-flex gap-2">
//                 {editingId === d.id ? (
//                   <>
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => saveEdit(d.id)}
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
//                       onClick={() => startEdit(d.id, d.name)}
//                     >
//                       Update
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => deleteItem(d.id)}
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

// export default DepartementList;
