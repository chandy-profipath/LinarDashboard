import React, { useState } from 'react';
import { Truck } from '@/types';
import { X, ChevronLeft, ChevronRight, Calendar, Gauge, Fuel, Cog, Zap, Palette } from 'lucide-react';

interface TruckViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  truck: Truck | null;
  isDark: boolean;
}

const TruckViewModal: React.FC<TruckViewModalProps> = ({ isOpen, onClose, truck, isDark }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !truck) return null;

  const images = [
    truck.main_image,
    truck.image1,
    truck.image2,
    truck.image3,
    truck.image4,
    truck.image5,
    truck.image6,
    truck.image7,
    truck.image8,
    truck.image9
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'sold': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'reserved': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: truck.year },
    { icon: Gauge, label: 'Mileage', value: `${truck.mileage.toLocaleString()} km` },
    { icon: Fuel, label: 'Fuel Type', value: truck.fuel_type },
    { icon: Cog, label: 'Transmission', value: truck.transmission },
    { icon: Zap, label: 'Horsepower', value: `${truck.horsepower} HP` },
    { icon: Palette, label: 'Color', value: truck.color },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl
        ${isDark ? 'bg-slate-800' : 'bg-white'}
        shadow-2xl animate-in zoom-in-95 duration-200
      `}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative h-80 lg:h-full bg-black">
            <img
              src={images[currentImageIndex]}
              alt={`${truck.brand} ${truck.model}`}
              className="w-full h-full object-cover"
            />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50 hover:bg-white/75'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-1.5 px-4 w-full">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-10 h-8 sm:w-14 sm:h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${idx === currentImageIndex
                    ? 'border-cyan-500 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 lg:p-8 overflow-y-auto max-h-[60vh] lg:max-h-[90vh]">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(truck.status)}`}>
                  {truck.status.charAt(0).toUpperCase() + truck.status.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                  {truck.brand}
                </span>
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {truck.brand} {truck.model}
              </h2>
              <p className="text-3xl font-bold text-cyan-500">
                £{truck.price.toLocaleString()}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {specs.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className={`
                    p-4 rounded-xl
                    ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isDark ? 'bg-slate-600' : 'bg-gray-200'}
                    `}>
                      <Icon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {label}
                      </p>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Engine</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {truck.engine_capacity || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>VIN</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {truck.vin || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {truck.description && (
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Description
                </h3>
                <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  {truck.description}
                </p>
              </div>
            )}

            {/* Features */}
            {truck.features && truck.features.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-700/50">
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {truck.features.map((feature, i) => (
                    <div
                      key={i}
                      className={`
                        flex items-center gap-2 p-3 rounded-xl
                        ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center
                        ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-500 text-white'}
                      `}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckViewModal;
