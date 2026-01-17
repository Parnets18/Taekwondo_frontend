import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'belt_promotion',
    description: '',
    styling: {
      dimensions: {
        width: 800,
        height: 600
      },
      backgroundColor: '#ffffff',
      margins: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      }
    },
    fields: []
  });
  const [newField, setNewField] = useState({
    name: '',
    type: 'text',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 30 },
    style: {
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'left'
    },
    required: true,
    defaultValue: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/certificate-templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/certificate-templates', newTemplate, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        alert('Template created successfully!');
        setShowCreateModal(false);
        fetchTemplates();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = async (templateId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/certificate-templates/${templateId}/preview`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const previewUrl = URL.createObjectURL(response.data);
      setPreviewTemplate({ id: templateId, url: previewUrl });
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplate = async (templateId, isActive) => {
    try {
      await axios.put(`/api/certificate-templates/${templateId}`, 
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template status');
    }
  };

  const addField = () => {
    setNewTemplate({
      ...newTemplate,
      fields: [...newTemplate.fields, { ...newField, id: Date.now() }]
    });
    setNewField({
      name: '',
      type: 'text',
      position: { x: 0, y: 0 },
      size: { width: 200, height: 30 },
      style: {
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        textAlign: 'left'
      },
      required: true,
      defaultValue: ''
    });
  };

  const removeField = (fieldId) => {
    setNewTemplate({
      ...newTemplate,
      fields: newTemplate.fields.filter(field => field.id !== fieldId)
    });
  };

  const resetForm = () => {
    setNewTemplate({
      name: '',
      type: 'belt_promotion',
      description: '',
      styling: {
        dimensions: {
          width: 800,
          height: 600
        },
        backgroundColor: '#ffffff',
        margins: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        }
      },
      fields: []
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeColor = (type) => {
    const colors = {
      belt_promotion: 'bg-yellow-100 text-yellow-800',
      course_completion: 'bg-blue-100 text-blue-800',
      special_achievement: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || colors.special_achievement;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Template
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                    {template.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div>Version: {template.version}</div>
                  <div>Fields: {template.fields?.length || 0}</div>
                  <div>Created: {formatDate(template.createdAt)}</div>
                  <div>Updated: {formatDate(template.updatedAt)}</div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreviewTemplate(template._id)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleToggleTemplate(template._id, template.isActive)}
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      {template.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Template</h3>
              
              <form onSubmit={handleCreateTemplate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Template Name</label>
                      <input
                        type="text"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Template Type</label>
                      <select
                        value={newTemplate.type}
                        onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="belt_promotion">Belt Promotion</option>
                        <option value="course_completion">Course Completion</option>
                        <option value="special_achievement">Special Achievement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={newTemplate.description}
                        onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                        required
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Styling */}
                    <h4 className="text-md font-medium text-gray-900 pt-4">Styling</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Width</label>
                        <input
                          type="number"
                          value={newTemplate.styling.dimensions.width}
                          onChange={(e) => setNewTemplate({
                            ...newTemplate,
                            styling: {
                              ...newTemplate.styling,
                              dimensions: {
                                ...newTemplate.styling.dimensions,
                                width: parseInt(e.target.value)
                              }
                            }
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Height</label>
                        <input
                          type="number"
                          value={newTemplate.styling.dimensions.height}
                          onChange={(e) => setNewTemplate({
                            ...newTemplate,
                            styling: {
                              ...newTemplate.styling,
                              dimensions: {
                                ...newTemplate.styling.dimensions,
                                height: parseInt(e.target.value)
                              }
                            }
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Background Color</label>
                      <input
                        type="color"
                        value={newTemplate.styling.backgroundColor}
                        onChange={(e) => setNewTemplate({
                          ...newTemplate,
                          styling: {
                            ...newTemplate.styling,
                            backgroundColor: e.target.value
                          }
                        })}
                        className="mt-1 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium text-gray-900">Template Fields</h4>
                      <button
                        type="button"
                        onClick={addField}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Add Field
                      </button>
                    </div>

                    {/* Add Field Form */}
                    <div className="border border-gray-200 rounded-md p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Field Name</label>
                          <input
                            type="text"
                            value={newField.name}
                            onChange={(e) => setNewField({...newField, name: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Type</label>
                          <select
                            value={newField.type}
                            onChange={(e) => setNewField({...newField, type: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="text">Text</option>
                            <option value="date">Date</option>
                            <option value="image">Image</option>
                            <option value="signature">Signature</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">X</label>
                          <input
                            type="number"
                            value={newField.position.x}
                            onChange={(e) => setNewField({
                              ...newField,
                              position: {...newField.position, x: parseInt(e.target.value)}
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Y</label>
                          <input
                            type="number"
                            value={newField.position.y}
                            onChange={(e) => setNewField({
                              ...newField,
                              position: {...newField.position, y: parseInt(e.target.value)}
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Width</label>
                          <input
                            type="number"
                            value={newField.size.width}
                            onChange={(e) => setNewField({
                              ...newField,
                              size: {...newField.size, width: parseInt(e.target.value)}
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Height</label>
                          <input
                            type="number"
                            value={newField.size.height}
                            onChange={(e) => setNewField({
                              ...newField,
                              size: {...newField.size, height: parseInt(e.target.value)}
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Existing Fields */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {newTemplate.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="text-sm">
                            <span className="font-medium">{field.name}</span>
                            <span className="text-gray-500 ml-2">({field.type})</span>
                            <span className="text-gray-500 ml-2">
                              {field.position.x},{field.position.y} - {field.size.width}x{field.size.height}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeField(field.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Template Preview</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  URL.revokeObjectURL(previewTemplate.url);
                  setPreviewTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center">
              <img
                src={previewTemplate.url}
                alt="Template Preview"
                className="max-w-full max-h-96 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;