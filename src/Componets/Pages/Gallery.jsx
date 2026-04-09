import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import galleryHero from '../../assets/photo1.jpg'; // Using existing image

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:9000';

  const categories = [
    'All', 
    'Seminars', 
    'Stunts', 
    'Our Memories', 
    'Video',
    'Competitions',
    'Belt Ceremonies'
  ];

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/gallery`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setPhotos(data.data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching gallery photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const getPhotoCategory = (photo) => photo.category || 'Our Memories';

  const filteredPhotos = selectedCategory === 'All' 
    ? photos 
    : photos.filter(photo => getPhotoCategory(photo) === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
        className="hero-section mobile-hero-fix relative py-20 sm:py-24 min-h-[60vh] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${galleryHero})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">Gallery</h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-4xl mx-auto leading-relaxed">
            Capturing moments of excellence and dedication
          </p>
        </div>
      </section>

      {/* Title and Description Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Gallery</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our collection of memorable moments from training sessions, competitions, belt ceremonies, 
            and special events. Each photo tells a story of dedication, discipline, and the spirit of Taekwon-Do.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => {
            const count = category === 'All' ? photos.length : photos.filter(p => getPhotoCategory(p) === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                {category}
                <span className="ml-2 text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Photos Found</h3>
            <p className="text-gray-500">
              {selectedCategory === 'All' 
                ? 'No photos available yet' 
                : `No photos in ${selectedCategory} category`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredPhotos.map((photo) => (
              <div
                key={photo._id}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform hover:scale-105 hover:shadow-2xl transition-all duration-300 border-4 border-white"
                onClick={() => openLightbox(photo)}
              >
                <div className="aspect-square">
                  <img
                    src={`${BASE_URL}/${photo.photo}`}
                    alt="Gallery photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Category Badge */}
                {photo.category && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      {getPhotoCategory(photo)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 pt-32"
          onClick={closeLightbox}
        >
          <div className="bg-white rounded-2xl p-4 w-[50vw] max-w-[600px] max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button
                onClick={closeLightbox}
                className="text-red-500 hover:text-red-700 text-3xl font-bold"
              >
                ×
              </button>
            </div>
            <img
              src={`${BASE_URL}/${selectedPhoto.photo}`}
              alt="Gallery photo"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
