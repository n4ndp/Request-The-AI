import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import modelService from '../../services/modelService';

const ModelManagement = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedModel, setSelectedModel] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modelToDelete, setModelToDelete] = useState(null);
    
    // Estados del formulario
    const [formData, setFormData] = useState({
        name: '',
        priceInput: '',
        priceOutput: '',
        provider: '',
        description: '',
        profitMargin: ''
    });

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            setLoading(true);
            const data = await modelService.getModels();
            setModels(data);
        } catch (error) {
            setError('Error al cargar los modelos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (mode, model = null) => {
        setModalMode(mode);
        setSelectedModel(model);
        
        if (model) {
            setFormData({
                name: model.name || '',
                priceInput: model.priceInput || '',
                priceOutput: model.priceOutput || '',
                provider: model.provider || '',
                description: model.description || '',
                profitMargin: '' // Este campo no se muestra en el response, solo se usa para crear/editar
            });
        } else {
            setFormData({
                name: '',
                priceInput: '',
                priceOutput: '',
                provider: '',
                description: '',
                profitMargin: ''
            });
        }
        
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedModel(null);
        setFormData({
            name: '',
            priceInput: '',
            priceOutput: '',
            provider: '',
            description: '',
            profitMargin: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const modelData = {
                name: formData.name,
                priceInput: parseFloat(formData.priceInput),
                priceOutput: parseFloat(formData.priceOutput),
                provider: formData.provider,
                description: formData.description,
                profitMargin: parseFloat(formData.profitMargin)
            };

            if (modalMode === 'create') {
                await modelService.createModel(modelData);
                setSuccess('Modelo creado exitosamente');
            } else if (modalMode === 'edit') {
                await modelService.updateModel(selectedModel.id, modelData);
                setSuccess('Modelo actualizado exitosamente');
            }
            
            handleCloseModal();
            loadModels();
        } catch (error) {
            setError('Error al guardar el modelo: ' + error.message);
        }
    };

    const handleDeleteClick = (model) => {
        setModelToDelete(model);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await modelService.deleteModel(modelToDelete.id);
            setSuccess('Modelo eliminado exitosamente');
            setShowDeleteModal(false);
            setModelToDelete(null);
            loadModels();
        } catch (error) {
            setError('Error al eliminar el modelo: ' + error.message);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4
        }).format(price);
    };

    if (loading) {
        return <div className="text-center">Cargando modelos...</div>;
    }

    return (
        <div className="model-management">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Gestión de Modelos</h3>
                <Button 
                    variant="primary" 
                    onClick={() => handleShowModal('create')}
                >
                    <FaPlus className="me-2" />
                    Nuevo Modelo
                </Button>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                    {success}
                </Alert>
            )}

            <Table responsive striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Proveedor</th>
                        <th>Precio Input</th>
                        <th>Precio Output</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {models.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No hay modelos disponibles
                            </td>
                        </tr>
                    ) : (
                        models.map(model => (
                            <tr key={model.id}>
                                <td>{model.id}</td>
                                <td>
                                    <strong>{model.name}</strong>
                                </td>
                                <td>
                                    <Badge bg="info">{model.provider}</Badge>
                                </td>
                                <td>{formatPrice(model.priceInput)}</td>
                                <td>{formatPrice(model.priceOutput)}</td>
                                <td>
                                    {model.description ? (
                                        model.description.length > 50 
                                            ? model.description.substring(0, 50) + '...'
                                            : model.description
                                    ) : (
                                        <em className="text-muted">Sin descripción</em>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            onClick={() => handleShowModal('view', model)}
                                            title="Ver detalles"
                                        >
                                            <FaEye />
                                        </Button>
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            onClick={() => handleShowModal('edit', model)}
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteClick(model)}
                                            title="Eliminar"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Modal para crear/editar/ver modelo */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === 'create' && 'Crear Nuevo Modelo'}
                        {modalMode === 'edit' && 'Editar Modelo'}
                        {modalMode === 'view' && 'Detalles del Modelo'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        disabled={modalMode === 'view'}
                                        placeholder="Ej: GPT-4"
                                        style={{ 
                                            color: modalMode === 'view' ? '#495057' : '#212529',
                                            backgroundColor: modalMode === 'view' ? '#e9ecef' : '#ffffff'
                                        }}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Proveedor *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="provider"
                                        value={formData.provider}
                                        onChange={handleInputChange}
                                        required
                                        disabled={modalMode === 'view'}
                                        placeholder="Ej: OpenAI"
                                        style={{ 
                                            color: modalMode === 'view' ? '#495057' : '#212529',
                                            backgroundColor: modalMode === 'view' ? '#e9ecef' : '#ffffff'
                                        }}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Precio Input (USD) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        name="priceInput"
                                        value={formData.priceInput}
                                        onChange={handleInputChange}
                                        required
                                        disabled={modalMode === 'view'}
                                        placeholder="0.0000"
                                        style={{ 
                                            color: modalMode === 'view' ? '#495057' : '#212529',
                                            backgroundColor: modalMode === 'view' ? '#e9ecef' : '#ffffff'
                                        }}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Precio Output (USD) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        name="priceOutput"
                                        value={formData.priceOutput}
                                        onChange={handleInputChange}
                                        required
                                        disabled={modalMode === 'view'}
                                        placeholder="0.0000"
                                        style={{ 
                                            color: modalMode === 'view' ? '#495057' : '#212529',
                                            backgroundColor: modalMode === 'view' ? '#e9ecef' : '#ffffff'
                                        }}
                                    />
                                </Form.Group>
                            </div>
                            {modalMode !== 'view' && (
                                <div className="col-md-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Margen de Ganancia *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="profitMargin"
                                            value={formData.profitMargin}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="0.00"
                                            style={{ 
                                                color: '#212529',
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                    </Form.Group>
                                </div>
                            )}
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={modalMode === 'view'}
                                placeholder="Descripción del modelo..."
                                style={{ 
                                    color: modalMode === 'view' ? '#495057' : '#212529',
                                    backgroundColor: modalMode === 'view' ? '#e9ecef' : '#ffffff'
                                }}
                            />
                        </Form.Group>

                        {modalMode !== 'view' && (
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" type="submit">
                                    {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                                </Button>
                            </div>
                        )}
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal de confirmación para eliminar */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modelToDelete && (
                        <>
                            <p>¿Estás seguro de que deseas eliminar el modelo:</p>
                            <p><strong>{modelToDelete.name}</strong> ({modelToDelete.provider})?</p>
                            <p className="text-danger">Esta acción no se puede deshacer.</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ModelManagement;
