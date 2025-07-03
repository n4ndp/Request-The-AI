import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Badge, FloatingLabel } from 'react-bootstrap';
import { FaUserPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import adminService from '../../services/adminService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Form data for create
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'USER'
    });

    // Form data for edit
    const [editFormData, setEditFormData] = useState({
        fullName: '',
        email: '',
        role: 'USER',
        balance: 0
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const usersData = await adminService.getAllUsers();
            setUsers(usersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await adminService.createUser(formData);
            setSuccess('Usuario creado exitosamente');
            setShowCreateModal(false);
            setFormData({
                username: '',
                password: '',
                fullName: '',
                email: '',
                role: 'USER'
            });
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateUser(selectedUser.username, editFormData);
            setSuccess('Usuario actualizado exitosamente');
            setShowEditModal(false);
            setSelectedUser(null);
            setEditFormData({
                fullName: '',
                email: '',
                role: 'USER',
                balance: 0
            });
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async () => {
        try {
            await adminService.deleteUser(selectedUser.username);
            setSuccess('Usuario eliminado exitosamente');
            setShowDeleteModal(false);
            setSelectedUser(null);
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'balance') {
            // No redondear, mantener el valor exacto ingresado por el usuario
            value = value === '' ? 0 : value;
        }
        setEditFormData({
            ...editFormData,
            [e.target.name]: value
        });
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditFormData({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            balance: user.balance || 0
        });
        setShowEditModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Gestión de Usuarios</h4>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <FaUserPlus className="me-2" />
                    Crear Usuario
                </Button>
            </div>

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : (
                <Table responsive striped hover className="user-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Balance</th>
                            <th>Registrado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.username}>
                                <td>{user.username}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <Badge bg={user.role === 'ADMIN' ? 'danger' : 'primary'} className="badge-role">
                                        {user.role}
                                    </Badge>
                                </td>
                                <td>${user.balance?.toFixed(2) || '0.00'}</td>
                                <td>{formatDate(user.registeredAt)}</td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="btn-action me-1"
                                        onClick={() => openEditModal(user)}
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="btn-action"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Modal de crear usuario */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" className="modal-create-user">
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nuevo Usuario</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateUser}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <FloatingLabel controlId="username" label="Nombre de usuario" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </FloatingLabel>
                            </div>
                            <div className="col-md-6">
                                <FloatingLabel controlId="password" label="Contraseña" className="mb-3">
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </FloatingLabel>
                            </div>
                        </div>
                        
                        <FloatingLabel controlId="fullName" label="Nombre completo" className="mb-3">
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </FloatingLabel>
                        
                        <FloatingLabel controlId="email" label="Email" className="mb-3">
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </FloatingLabel>
                        
                        <FloatingLabel controlId="role" label="Rol">
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="USER">Usuario</option>
                                <option value="ADMIN">Administrador</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Crear Usuario
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal de editar usuario */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" className="modal-create-user">
                <Modal.Header closeButton>
                    <Modal.Title>Editar Usuario: {selectedUser?.username}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditUser}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <FloatingLabel controlId="editFullName" label="Nombre completo" className="mb-3">
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={editFormData.fullName}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </FloatingLabel>
                            </div>
                            <div className="col-md-6">
                                <FloatingLabel controlId="editEmail" label="Email" className="mb-3">
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </FloatingLabel>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col-md-6">
                                <FloatingLabel controlId="editRole" label="Rol" className="mb-3">
                                    <Form.Select
                                        name="role"
                                        value={editFormData.role}
                                        onChange={handleEditChange}
                                        required
                                    >
                                        <option value="USER">Usuario</option>
                                        <option value="ADMIN">Administrador</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </div>
                            <div className="col-md-6">
                                <FloatingLabel controlId="editBalance" label="Balance ($)" className="mb-3">
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        max="999999999"
                                        name="balance"
                                        value={editFormData.balance}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </FloatingLabel>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Actualizar Usuario
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal de confirmación de eliminación */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser?.username}</strong>?
                    <br />
                    <small className="text-muted">Esta acción no se puede deshacer.</small>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDeleteUser}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement; 