import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, TRUCK_BRANDS } from '@/types';
import TruckCard from './TruckCard';
import TruckModal from './TruckModal';
import TruckViewModal from './TruckViewModal';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface TrucksPageProps {
  isDark: boolean;
}

const TrucksPage: React.FC<TrucksPageProps> = ({ isDark }) => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Truck | null>(null);

  useEffect(() => {
    fetchTrucks();

    // Realtime subscription
    const channel = supabase
      .channel('trucks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trucks',
        },
        (payload) => {
          console.log('Realtime change:', payload);
          if (payload.eventType === 'INSERT') {
            setTrucks((prev) => [payload.new as Truck, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTrucks((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as Truck) : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setTrucks((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrucks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrucks(data || []);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrucks = useMemo(() => {
    let result = [...trucks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(truck =>
        truck.brand.toLowerCase().includes(query) ||
        truck.model.toLowerCase().includes(query) ||
        truck.vin?.toLowerCase().includes(query)
      );
    }

    // Brand filter
    if (selectedBrand) {
      result = result.filter(truck => truck.brand === selectedBrand);
    }

    // Price filter
    result = result.filter(truck =>
      truck.price >= priceRange.min && truck.price <= priceRange.max
    );

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'brand':
        result.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
    }

    return result;
  }, [trucks, searchQuery, selectedBrand, priceRange, sortBy]);

  const handleEdit = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsModalOpen(true);
  };

  const handleView = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (truck: Truck) => {
    try {
      // 1. Cleanup Storage
      if (truck.tuuid) {
        const cleanTuuid = truck.tuuid.trim().replace(/^\/|\/$/g, '');
        console.log(`Starting storage cleanup for TUUID: ${cleanTuuid}`);

        const { data: files, error: listError } = await supabase.storage
          .from('truckimages')
          .list(cleanTuuid);

        let filesToDelete: string[] = [];
        if (!listError && files && files.length > 0) {
          filesToDelete = files.map(file => `${cleanTuuid}/${file.name}`);
        }

        const imageFields = ['main_image', 'image1', 'image2', 'image3', 'image4', 'image5', 'image6', 'image7', 'image8', 'image9'];
        imageFields.forEach(field => {
          const url = (truck as any)[field];
          if (url && url.includes('/truckimages/')) {
            const path = url.split('/truckimages/')[1].split('?')[0];
            if (!filesToDelete.includes(path)) {
              filesToDelete.push(path);
            }
          }
        });

        if (filesToDelete.length > 0) {
          await supabase.storage.from('truckimages').remove(filesToDelete);
        }
      }

      // 2. Delete from Database
      const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', truck.id);

      if (error) throw error;
      setTrucks(prev => prev.filter(t => t.id !== truck.id));
      setDeleteConfirm(null);
      toast.success("Truck and associated images deleted successfully");
    } catch (error) {
      console.error('Error deleting truck:', error);
      toast.error("Could not delete the truck. Please try again.");
    }
  };

  const handleAddNew = () => {
    setSelectedTruck(null);
    setIsModalOpen(true);
  };

  const uniqueBrands = useMemo(() => {
    return [...new Set(trucks.map(t => t.brand))].sort();
  }, [trucks]);

  const inputClass = `
    w-full px-4 py-2.5 rounded-xl transition-all
    ${isDark
      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
    }
    border focus:outline-none focus:ring-2 focus:ring-cyan-500/20
  `;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Fleet Management
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {filteredTrucks.length} trucks in inventory
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Truck
        </button>
      </div>

      {/* Filters Bar */}
      <div className={`
        p-4 rounded-2xl
        ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
      `}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search by brand, model, or VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-12`}
            />
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className={`${inputClass} w-full lg:w-48`}
          >
            <option value="">All Brands</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`${inputClass} w-full lg:w-48`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="brand">Brand A-Z</option>
          </select>

          {/* View Toggle */}
          <div className={`
            flex rounded-xl overflow-hidden border
            ${isDark ? 'border-slate-700' : 'border-gray-200'}
          `}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid'
                ? 'bg-cyan-500 text-white'
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-gray-400 hover:text-gray-600'
                }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list'
                ? 'bg-cyan-500 text-white'
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-gray-400 hover:text-gray-600'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors
              ${showFilters
                ? 'bg-cyan-500 text-white'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={`
            mt-4 pt-4 border-t
            ${isDark ? 'border-slate-700' : 'border-gray-200'}
          `}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    £{priceRange[0].toLocaleString()} - £{priceRange[1].toLocaleString()}
                  </span>
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    className="flex-1 accent-cyan-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="flex-1 accent-cyan-500"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBrand('');
                    setPriceRange({ min: 0, max: 500000 });
                    setSortBy('newest');
                  }}
                  className={`
                    px-4 py-2 rounded-xl text-sm transition-colors
                    ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        </div>
      ) : filteredTrucks.length === 0 ? (
        <div className={`
          flex flex-col items-center justify-center h-64 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <Filter className={`w-12 h-12 mb-4 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            No trucks found
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            Try adjusting your filters
          </p>
        </div>
      ) : (
        /* Trucks Grid */
        <div className={`
          grid gap-6
          ${viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
          }
        `}>
          {filteredTrucks.map((truck) => (
            <TruckCard
              key={truck.id}
              truck={truck}
              isDark={isDark}
              onEdit={handleEdit}
              onDelete={(t) => setDeleteConfirm(t)}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <TruckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        truck={selectedTruck}
        isDark={isDark}
        onSave={fetchTrucks}
      />

      {/* View Modal */}
      <TruckViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        truck={selectedTruck}
        isDark={isDark}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className={`
            relative w-full max-w-md p-6 rounded-2xl
            ${isDark ? 'bg-slate-800' : 'bg-white'}
            shadow-2xl animate-in zoom-in-95 duration-200
          `}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Delete Truck
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Are you sure you want to delete <strong>{deleteConfirm.brand} {deleteConfirm.model}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-colors
                  ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrucksPage;
