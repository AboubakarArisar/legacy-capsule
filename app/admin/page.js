"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  DollarSign,
  Users,
  FileText,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

export default function AdminDashboard() {
  const [templates, setTemplates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    features: [""],
    isActive: true,
    pdfUrl: "",
    imageUrl: "",
  });

  const categories = [
    "leaving-a-memory",
    "birthday-gift",
    "wedding-memories",
    "family-memory-book",
    "family-recipe-collection",
    "life-story-journal",
    "baby-first-year",
    "memorial-tribute",
    "school-year-memory",
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [templatesRes, ordersRes] = await Promise.all([
        fetch("/api/templates"),
        fetch("/api/orders"),
      ]);

      const templatesData = await templatesRes.json();
      const ordersData = await ordersRes.json();

      if (templatesData.success) {
        setTemplates(templatesData.templates);
      }

      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file, kind) => {
    try {
      if (!file) return;
      const isPdf = kind === "pdf";

      if (isPdf) setIsUploadingPdf(true);
      else setIsUploadingImage(true);

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      if (isPdf) {
        setFormData((prev) => ({ ...prev, pdfUrl: data.url }));
      } else {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch (e) {
      alert((e && e.message) || "Upload failed");
    } finally {
      setIsUploadingPdf(false);
      setIsUploadingImage(false);
    }
  };

  const onPickFile = (accept, kind) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files && input.files[0];
      handleUpload(file, kind);
    };
    input.click();
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();

    if (isUploadingPdf || isUploadingImage) {
      alert("Please wait for uploads to finish");
      return;
    }

    if (!formData.pdfUrl) {
      alert("Please provide a PDF URL");
      return;
    }
    if (!formData.imageUrl) {
      alert("Please provide a preview image URL");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          features: formData.features.filter((f) => f.trim() !== ""),
          isActive: formData.isActive,
          pdfUrl: formData.pdfUrl,
          imageUrl: formData.imageUrl,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchAdminData();
        alert("Template created successfully!");
      } else {
        alert("Error creating template: " + data.error);
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Error creating template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTemplate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/templates/${editingTemplate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          features: formData.features.filter((f) => f.trim() !== ""),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingTemplate(null);
        resetForm();
        fetchAdminData();
      } else {
        alert("Error updating template: " + data.error);
      }
    } catch (error) {
      console.error("Error updating template:", error);
      alert("Error updating template");
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert("Error deleting template: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Error deleting template");
    }
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      price: template.price.toString(),
      category: template.category,
      features: template.features,
      isActive: template.isActive,
      pdfUrl: template.pdfUrl,
      imageUrl: template.imageUrl,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      features: [""],
      isActive: true,
      pdfUrl: "",
      imageUrl: "",
    });
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const totalRevenue = orders
    .filter((order) => order.status === 'completed' || order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
  const totalOrders = orders.filter((order) => order.status === 'completed' || order.paymentStatus === 'paid').length;
  const activeTemplates = templates.filter((t) => t.isActive).length;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (e) {
      // no-op
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-black'>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-black mb-2'>
              Admin Dashboard
            </h1>
            <p className='text-black'>
              Manage templates, orders, and view analytics
            </p>
          </div>
          <Button variant='outline' onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Overview Stats */}
        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Revenue
              </CardTitle>
              <DollarSign className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-black'>
                ${totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Orders
              </CardTitle>
              <Users className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-black'>{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Templates
              </CardTitle>
              <FileText className='h-4 w-4 text-purple-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-black'>
                {activeTemplates}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Management */}
        <Card className='mb-8'>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <div>
                <CardTitle>Template Management</CardTitle>
                <CardDescription>
                  Create, edit, and manage PDF templates
                </CardDescription>
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className='w-4 h-4 mr-2' />
                Create Template
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2 text-black'>Title</th>
                    <th className='text-left py-2 text-black'>Category</th>
                    <th className='text-left py-2 text-black'>Price</th>
                    <th className='text-left py-2 text-black'>PDF File</th>
                    <th className='text-left py-2 text-black'>Preview Image</th>
                    <th className='text-left py-2 text-black'>Status</th>
                    <th className='text-left py-2 text-black'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template._id} className='border-b'>
                      <td className='py-2 text-black'>{template.title}</td>
                      <td className='py-2 text-black'>{template.category}</td>
                      <td className='py-2 text-black'>${template.price}</td>
                      <td className='py-2 text-black'>
                        {template.pdfUrl ? (
                          <div className='text-xs'>
                            <p className='font-medium'>📄 PDF Available</p>
                            <p className='text-slate-600'>Ready for download</p>
                          </div>
                        ) : (
                          <span className='text-red-500 text-xs'>No PDF</span>
                        )}
                      </td>
                      <td className='py-2 text-black'>
                        {template.imageUrl ? (
                          <div className='text-xs'>
                            <p className='font-medium'>🖼️ Preview Image</p>
                            <p className='text-slate-600'>Available</p>
                          </div>
                        ) : (
                          <span className='text-slate-500 text-xs'>
                            No Preview
                          </span>
                        )}
                      </td>
                      <td className='py-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            template.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className='py-2'>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => openEditModal(template)}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeleteTemplate(template._id)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest customer orders and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2 text-black'>Order ID</th>
                    <th className='text-left py-2 text-black'>Customer</th>
                    <th className='text-left py-2 text-black'>Template</th>
                    <th className='text-left py-2 text-black'>Amount</th>
                    <th className='text-left py-2 text-black'>Status</th>
                    <th className='text-left py-2 text-black'>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order._id} className='border-b'>
                      <td className='py-2 text-black'>{order._id.slice(-8)}</td>
                      <td className='py-2 text-black'>
                        {order.customerEmail || "N/A"}
                      </td>
                      <td className='py-2 text-black'>
                        {order.templateTitle || "N/A"}
                      </td>
                      <td className='py-2 text-black'>${order.amount}</td>
                      <td className='py-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className='py-2 text-black'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-black'>
                  Create New Template
                </h2>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>

              <form
                onSubmit={handleCreateTemplate}
                className='space-y-4 text-black'
              >
                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Title
                  </label>
                  <input
                    type='text'
                    required
                    className='w-full px-3 py-2 border border-slate-300 rounded-md'
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Description
                  </label>
                  <textarea
                    required
                    rows='3'
                    className='w-full px-3 py-2 border border-slate-300 rounded-md'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-black mb-2'>
                      Price ($)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      className='w-full px-3 py-2 border border-slate-300 rounded-md'
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-black mb-2'>
                      Category
                    </label>
                    <select
                      required
                      className='w-full px-3 py-2 border border-slate-300 rounded-md'
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value=''>Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Features
                  </label>
                  <div className='space-y-2'>
                    {formData.features.map((feature, index) => (
                      <div key={index} className='flex space-x-2'>
                        <input
                          type='text'
                          className='flex-1 px-3 py-2 border border-slate-300 rounded-md'
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder='Enter feature description'
                        />
                        {formData.features.length > 1 && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => removeFeature(index)}
                          >
                            <X className='w-4 h-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addFeature}
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Feature
                    </Button>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='isActive'
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor='isActive' className='text-sm text-black'>
                    Active Template
                  </label>
                </div>

                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    PDF URL
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='url'
                      required
                      placeholder='https://res.cloudinary.com/.../template.pdf'
                      className='w-full px-3 py-2 border border-slate-300 rounded-md'
                      readOnly
                      value={formData.pdfUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pdfUrl: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => onPickFile("application/pdf", "pdf")}
                      disabled={isUploadingPdf}
                    >
                      {isUploadingPdf ? "Uploading…" : "Upload PDF"}
                    </Button>
                  </div>
                  <p className='text-xs text-black mt-1'>
                    Upload or paste a public Cloudinary PDF URL.
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Preview Image URL
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='url'
                      required
                      placeholder='https://res.cloudinary.com/.../preview.jpg'
                      className='w-full px-3 py-2 border border-slate-300 rounded-md'
                      readOnly
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => onPickFile("image/*", "image")}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? "Uploading…" : "Upload Image"}
                    </Button>
                  </div>
                  <p className='text-xs text-black mt-1'>
                    Upload or paste a public Cloudinary image URL.
                  </p>
                </div>

                <div className='flex justify-end space-x-2 pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={
                      isSubmitting || isUploadingPdf || isUploadingImage
                    }
                  >
                    {isSubmitting
                      ? "Creating…"
                      : isUploadingPdf || isUploadingImage
                      ? "Please wait…"
                      : "Create Template"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Template Modal */}
        {showEditModal && editingTemplate && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-black'>Edit Template</h2>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>

              <form onSubmit={handleEditTemplate} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Title
                  </label>
                  <input
                    type='text'
                    required
                    className='w-full px-3 py-2 border border-slate-300 rounded-md'
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Description
                  </label>
                  <textarea
                    required
                    rows='3'
                    className='w-full px-3 py-2 border border-slate-300 rounded-md'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-black mb-2'>
                      Price ($)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      className='w-full px-3 py-2 border border-slate-300 rounded-md'
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-black mb-2'>
                      Category
                    </label>
                    <select
                      required
                      className='w-full px-3 py-2 border border-slate-300 rounded-md'
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value=''>Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-black mb-2'>
                    Features
                  </label>
                  <div className='space-y-2'>
                    {formData.features.map((feature, index) => (
                      <div key={index} className='flex space-x-2'>
                        <input
                          type='text'
                          className='flex-1 px-3 py-2 border border-slate-300 rounded-md'
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder='Enter feature description'
                        />
                        {formData.features.length > 1 && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => removeFeature(index)}
                          >
                            <X className='w-4 h-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addFeature}
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Feature
                    </Button>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='editIsActive'
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor='editIsActive' className='text-sm text-black'>
                    Active Template
                  </label>
                </div>

                <div className='flex justify-end space-x-2 pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Update Template</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 