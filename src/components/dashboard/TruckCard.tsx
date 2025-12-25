import React from 'react';
import { Truck } from '@/types';
import { Edit2, Trash2, Eye, Calendar, Gauge, Fuel } from 'lucide-react';

interface TruckCardProps {
  truck: Truck;
  isDark: boolean;
  onEdit: (truck: Truck) => void;
  onDelete: (truck: Truck) => void;
  onView: (truck: Truck) => void;
}

const TruckCard: React.FC<TruckCardProps> = ({ truck, isDark, onEdit, onDelete, onView }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'sold': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'reserved': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`
      group rounded-2xl overflow-hidden transition-all duration-300
      hover:scale-[1.02] hover:shadow-2xl
      ${isDark 
        ? 'bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 hover:shadow-cyan-500/10' 
        : 'bg-white border border-gray-200 hover:border-cyan-500/50 hover:shadow-cyan-500/20'
      }
    `}>
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={truck.main_image} 
          alt={`${truck.brand} ${truck.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className={`
          absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
          border backdrop-blur-sm ${getStatusColor(truck.status)}
        `}>
          {truck.status.charAt(0).toUpperCase() + truck.status.slice(1)}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onView(truck); }}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(truck); }}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(truck); }}
            className="p-2 rounded-lg bg-red-500/50 backdrop-blur-sm text-white hover:bg-red-500/70 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
            {truck.brand}
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="text-xl font-bold text-white drop-shadow-lg">
            ${truck.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {truck.brand} {truck.model}
        </h3>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {truck.year}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {(truck.mileage / 1000).toFixed(0)}k mi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {truck.fuel_type}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className={`
          flex items-center justify-between pt-3 border-t
          ${isDark ? 'border-slate-700/50' : 'border-gray-200'}
        `}>
          <div>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {truck.horsepower} HP
            </span>
            <span className={`mx-2 ${isDark ? 'text-slate-600' : 'text-gray-300'}`}>•</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {truck.transmission}
            </span>
          </div>
          <div className={`
            w-4 h-4 rounded-full border-2
            ${isDark ? 'border-slate-600' : 'border-gray-300'}
          `} style={{ backgroundColor: truck.color?.toLowerCase() || '#888' }} />
        </div>
      </div>
    </div>
  );
};

export default TruckCard;
