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
  const [requests, setRequests] = useState([]);
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
  const [activeTab, setActiveTab] = useState("templates");

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
      const [templatesRes, ordersRes, requestsRes] = await Promise.all([
        fetch("/api/templates"),
        fetch("/api/orders"),
        fetch("/api/requests"),
      ]);

      const templatesData = await templatesRes.json();
      const ordersData = await ordersRes.json();
      const requestsData = await requestsRes.json();

      if (templatesData.success) {
        setTemplates(templatesData.templates);
      }

      if (ordersData.success) {
        setOrders(ordersData.orders);
      }

      if (requestsData.success) {
        setRequests(requestsData.requests || []);
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
    .filter(
      (order) => order.status === "completed" || order.paymentStatus === "paid"
    )
    .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
  const totalOrders = orders.filter(
    (order) => order.status === "completed" || order.paymentStatus === "paid"
  ).length;
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

        {/* Template Requests Tab */}
        <div className='flex items-center space-x-4'>
          <Button
            variant={activeTab === "templates" ? "default" : "outline"}
            size='sm'
            onClick={() => setActiveTab("templates")}
          >
            Templates
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            size='sm'
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </Button>
          <Button
            variant={activeTab === "requests" ? "default" : "outline"}
            size='sm'
            onClick={() => setActiveTab("requests")}
          >
            Template Requests
          </Button>
        </div>

        {/* Templates as Cards */}
        {activeTab === "templates" ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'>
            {templates.map((t) => (
              <Card key={t._id} className='overflow-hidden'>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span className='truncate text-black'>{t.title}</span>
                    <span className='text-sm text-slate-600'>${t.price}</span>
                  </CardTitle>
                  <CardDescription className='flex items-center gap-2'>
                    <span className='px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700'>
                      {t.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        t.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='text-slate-700'>
                      <div className='mb-1'>
                        {t.pdfUrl ? "📄 PDF Available" : "No PDF"}
                      </div>
                      <div>
                        {t.imageUrl ? "🖼️ Preview Image" : "No Preview"}
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openEditModal(t)}
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDeleteTemplate(t._id)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && (
              <Card className='col-span-full'>
                <CardContent className='py-8 text-center text-slate-600'>
                  No templates yet.
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Orders as Cards */}
        {activeTab === "orders" ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'>
            {orders.map((o) => (
              <Card key={o._id}>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span className='text-sm text-slate-700'>
                      Order #{String(o._id).slice(-8)}
                    </span>
                    <span className='font-semibold text-black'>
                      ${o.amount}
                    </span>
                  </CardTitle>
                  <CardDescription className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        o.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : o.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className='text-xs text-slate-500'>
                      {new Date(o.createdAt).toLocaleString()}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className='text-sm text-slate-700'>
                  <div className='mb-1'>
                    Customer: {o.customerEmail || "N/A"}
                  </div>
                  <div>
                    Template:{" "}
                    {o.templateTitle ||
                      (o.templateId && o.templateId.title) ||
                      "N/A"}
                  </div>
                </CardContent>
              </Card>
            ))}
            {orders.length === 0 && (
              <Card className='col-span-full'>
                <CardContent className='py-8 text-center text-slate-600'>
                  No orders found.
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Requests as Cards */}
        {activeTab === "requests" ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'>
            {requests.map((r) => (
              <Card key={r._id}>
                <CardHeader>
                  <CardTitle className='text-black'>{r.Name}</CardTitle>
                  <CardDescription className='text-slate-600'>
                    {r.Email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className='text-sm text-slate-700 mb-3 line-clamp-4'
                    title={r.TemplateDescription}
                  >
                    {r.TemplateDescription}
                  </p>
                  <div className='text-xs text-slate-500'>
                    Submitted {new Date(r.createdAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
              <Card className='col-span-full'>
                <CardContent className='py-8 text-center text-slate-600'>
                  No requests yet.
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
