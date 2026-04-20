import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaImage,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    order: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://cwtakarnataka.com/api/api";

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/banners`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch banners");

      const data = await response.json();
      console.log("Fetched banners:", data.data.banners);
      setBanners(data.data.banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      alert("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const url = selectedBanner
        ? `${API_BASE_URL}/admin/banners/${selectedBanner._id}`
        : `${API_BASE_URL}/admin/banners`;

      const response = await fetch(url, {
        method: selectedBanner ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save banner");
      }

      alert(`Banner ${selectedBanner ? "updated" : "created"} successfully!`);
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert(`Failed to save banner: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      order: banner.order,
      isActive: banner.isActive,
    });
    // Only set image preview if banner has an image
    if (banner.image) {
      const imageUrl = `${API_BASE_URL.replace("/api", "")}/${banner.image}`;
      console.log("Setting image preview URL:", imageUrl);
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete banner");

      alert("Banner deleted successfully!");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner");
    }
  };

  const handleView = (banner) => {
    setSelectedBanner(banner);
    setShowViewModal(true);
  };

  const handleMoveUp = async (banner, index) => {
    if (index === 0) return;

    const newBanners = [...banners];
    [newBanners[index], newBanners[index - 1]] = [
      newBanners[index - 1],
      newBanners[index],
    ];

    await updateBannerOrder(newBanners);
  };

  const handleMoveDown = async (banner, index) => {
    if (index === banners.length - 1) return;

    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [
      newBanners[index + 1],
      newBanners[index],
    ];

    await updateBannerOrder(newBanners);
  };

  const updateBannerOrder = async (orderedBanners) => {
    try {
      const token = localStorage.getItem("token");
      const bannersWithOrder = orderedBanners.map((banner, index) => ({
        id: banner._id,
        order: index,
      }));

      const response = await fetch(`${API_BASE_URL}/admin/banners/order`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ banners: bannersWithOrder }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      fetchBanners();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update banner order");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      order: 0,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedBanner(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading banners...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Banner Management</h2>
        <button
          onClick={openAddModal}
          className="text-white px-4 py-2 rounded-lg flex items-center hover:opacity-90 transition-colors"
          style={{ backgroundColor: "#006CB5" }}
        >
          <FaPlus className="mr-2" />
          Add Banner
        </button>
      </div>

      {/* Banners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subtitle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((banner, index) => (
              <tr key={banner._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{index + 1}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMoveUp(banner, index)}
                        disabled={index === 0}
                        className={`${index === 0 ? "text-gray-300" : "hover:opacity-80"}`}
                        style={index !== 0 ? { color: "#006CB5" } : {}}
                      >
                        <FaArrowUp className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(banner, index)}
                        disabled={index === banners.length - 1}
                        className={`${index === banners.length - 1 ? "text-gray-300" : "hover:opacity-80"}`}
                        style={
                          index !== banners.length - 1
                            ? { color: "#006CB5" }
                            : {}
                        }
                      >
                        <FaArrowDown className="text-xs" />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {banner.image ? (
                    <img
                      src={`${API_BASE_URL.replace("/api", "")}/${banner.image}`}
                      alt={banner.title}
                      className="h-12 w-20 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center">
                      <FaImage className="text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {banner.title}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{banner.subtitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleView(banner)}
                    className="hover:opacity-80 mr-3"
                    style={{ color: "#006CB5" }}
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="hover:opacity-80 mr-3"
                    style={{ color: "#006CB5" }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="hover:opacity-80"
                    style={{ color: "#dc2626" }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {banners.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No banners found. Click "Add Banner" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {selectedBanner ? "Edit Banner" : "Add New Banner"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle *
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Image (Optional){" "}
                    {selectedBanner && "(Leave empty to keep current image)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded"
                        onError={(e) => {
                          console.error("Image failed to load:", imagePreview);
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="h-32 w-full bg-gray-200 rounded items-center justify-center hidden">
                        <div className="text-center">
                          <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">
                            Image failed to load
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:bg-gray-400"
                    style={{
                      backgroundColor: isSubmitting ? "#9ca3af" : "#006CB5",
                    }}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : selectedBanner
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedBanner && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Banner Details</h3>

              <div className="space-y-4">
                {selectedBanner.image ? (
                  <div>
                    <img
                      src={`${API_BASE_URL.replace("/api", "")}/${selectedBanner.image}`}
                      alt={selectedBanner.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FaImage className="text-6xl text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No image uploaded</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Title
                    </label>
                    <p className="mt-1 text-gray-900">{selectedBanner.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Subtitle
                    </label>
                    <p className="mt-1 text-gray-900">
                      {selectedBanner.subtitle}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedBanner.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <p className="mt-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedBanner.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedBanner.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Order
                    </label>
                    <p className="mt-1 text-gray-900">{selectedBanner.order}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: "#006CB5" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerManagement;
