import React, { useState, useEffect } from 'react';
import { Truck, TRUCK_BRANDS, FUEL_TYPES, TRANSMISSIONS, TRUCK_STATUS } from '@/types';
import { supabase } from '@/lib/supabase';
import { X, Upload, Loader2, ImagePlus } from 'lucide-react';

interface TruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  truck: Truck | null;
  isDark: boolean;
  onSave: () => void;
}

const TruckModal: React.FC<TruckModalProps> = ({ isOpen, onClose, truck, isDark, onSave }) => {
  const [formData, setFormData] = useState({
    tuuid: '',
    brand: '',
    customBrand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    engine_capacity: '',
    horsepower: 0,
    color: '',
    vin: '',
    description: '',
    status: 'available' as 'available' | 'sold' | 'reserved',
    main_image: '',
    image1: '',
    image2: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (truck) {
        setFormData({
          tuuid: truck.tuuid || crypto.randomUUID(), // Fallback for existing trucks
          brand: TRUCK_BRANDS.includes(truck.brand as any) ? truck.brand : 'Custom',
          customBrand: TRUCK_BRANDS.includes(truck.brand as any) ? '' : truck.brand,
          model: truck.model,
          year: truck.year,
          price: truck.price,
          mileage: truck.mileage,
          fuel_type: truck.fuel_type,
          transmission: truck.transmission,
          engine_capacity: truck.engine_capacity || '',
          horsepower: truck.horsepower || 0,
          color: truck.color || '',
          vin: truck.vin || '',
          description: truck.description || '',
          status: truck.status,
          main_image: truck.main_image || '',
          image1: truck.image1 || '',
          image2: truck.image2 || ''
        });
      } else {
        setFormData({
          tuuid: crypto.randomUUID(),
          brand: '',
          customBrand: '',
          model: '',
          year: new Date().getFullYear(),
          price: 0,
          mileage: 0,
          fuel_type: 'Diesel',
          transmission: 'Automatic',
          engine_capacity: '',
          horsepower: 0,
          color: '',
          vin: '',
          description: '',
          status: 'available',
          main_image: '',
          image1: '',
          image2: ''
        });
      }
    }
  }, [truck, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.tuuid) {
      setError('Please close and reopen the form to try again.');
      return;
    }

    // Immediate preview
    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [imageField]: objectUrl })); // Show preview

    setUploadingImage(imageField);
    setError(''); // Clear previous errors

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${imageField}.${fileExt}`;
      const filePath = `${formData.tuuid}/${fileName}`;

      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from('truckimages')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: UrlData } = supabase.storage
        .from('truckimages')
        .getPublicUrl(filePath);

      if (!UrlData.publicUrl) {
        throw new Error('Could not get image link. Please try again.');
      }

      // Update state with valid Public URL
      setFormData(prev => ({ ...prev, [imageField]: UrlData.publicUrl }));

    } catch (err: any) {
      console.error('Upload error:', err);
      // Revert the preview if upload failed
      setFormData(prev => ({ ...prev, [imageField]: '' }));
      setError('Could not upload the image. Please try another one.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const brand = formData.brand === 'Custom' ? formData.customBrand : formData.brand;

      const truckData = {
        tuuid: formData.tuuid,
        brand,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        mileage: formData.mileage,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        engine_capacity: formData.engine_capacity,
        horsepower: formData.horsepower,
        color: formData.color,
        vin: formData.vin,
        description: formData.description,
        status: formData.status,
        main_image: formData.main_image,
        image1: formData.image1,
        image2: formData.image2,
        updated_at: new Date().toISOString()
      };

      if (truck) {
        const { error } = await supabase
          .from('trucks')
          .update(truckData)
          .eq('id', truck.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trucks')
          .insert([truckData]);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError('Could not save the truck details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = `
    w-full px-4 py-3 rounded-xl transition-all
    ${isDark
      ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
    }
    border focus:outline-none focus:ring-2 focus:ring-cyan-500/20
  `;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl
        ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}
        shadow-2xl animate-in zoom-in-95 duration-200
      `}>
        {/* Header */}
        <div className={`
          sticky top-0 z-10 flex items-center justify-between p-6 border-b
          ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}
        `}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {truck ? 'Edit Truck' : 'Add New Truck'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Images Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Truck Images
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {['main_image', 'image1', 'image2'].map((field, idx) => (
                <div key={field}>
                  <label className={labelClass}>
                    {idx === 0 ? 'Main Image' : `Image ${idx + 1}`}
                  </label>
                  <div className={`
                    relative h-40 rounded-xl border-2 border-dashed overflow-hidden
                    ${isDark ? 'border-slate-600 hover:border-cyan-500' : 'border-gray-300 hover:border-cyan-500'}
                    transition-colors cursor-pointer group
                  `}>
                    {formData[field as keyof typeof formData] ? (
                      <>
                        <img
                          src={formData[field as keyof typeof formData] as string}
                          alt={`Truck ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm">Click to change</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        {uploadingImage === field ? (
                          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                        ) : (
                          <>
                            <ImagePlus className={`w-8 h-8 mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                              Upload Image
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, field)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className={inputClass}
                required
              >
                <option value="">Select Brand</option>
                {TRUCK_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {formData.brand === 'Custom' && (
              <div>
                <label className={labelClass}>Custom Brand Name</label>
                <input
                  type="text"
                  value={formData.customBrand}
                  onChange={(e) => setFormData(prev => ({ ...prev, customBrand: e.target.value }))}
                  placeholder="Enter brand name"
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., FH16, Actros"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                min="1990"
                max={new Date().getFullYear() + 1}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                min="0"
                step="1"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Mileage (km)</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                min="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Fuel Type</label>
              <select
                value={formData.fuel_type}
                onChange={(e) => setFormData(prev => ({ ...prev, fuel_type: e.target.value }))}
                className={inputClass}
              >
                {FUEL_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Transmission</label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                className={inputClass}
              >
                {TRANSMISSIONS.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Engine Capacity</label>
              <input
                type="text"
                value={formData.engine_capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, engine_capacity: e.target.value }))}
                placeholder="e.g., 13.0L"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Horsepower</label>
              <input
                type="number"
                value={formData.horsepower}
                onChange={(e) => setFormData(prev => ({ ...prev, horsepower: parseInt(e.target.value) }))}
                min="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="e.g., White, Blue"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>VIN</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                placeholder="Vehicle Identification Number"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className={inputClass}
              >
                {TRUCK_STATUS.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Enter truck description..."
              className={inputClass}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`
                px-6 py-3 rounded-xl font-medium transition-colors
                ${isDark
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {truck ? 'Update Truck' : 'Add Truck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TruckModal;
