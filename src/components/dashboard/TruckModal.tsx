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
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    image6: '',
    image7: '',
    image8: '',
    image9: '',
    features: [] as string[]
  });
  const [featuresInput, setFeaturesInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (truck) {
        setFormData({
          tuuid: truck.tuuid || crypto.randomUUID(),
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
          image2: truck.image2 || '',
          image3: truck.image3 || '',
          image4: truck.image4 || '',
          image5: truck.image5 || '',
          image6: truck.image6 || '',
          image7: truck.image7 || '',
          image8: truck.image8 || '',
          image9: truck.image9 || '',
          features: truck.features || []
        });
        setFeaturesInput((truck.features || []).join('\n'));
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
          image2: '',
          image3: '',
          image4: '',
          image5: '',
          image6: '',
          image7: '',
          image8: '',
          image9: '',
          features: []
        });
        setFeaturesInput('');
      }
    }
  }, [truck, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate preview
    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [imageField]: objectUrl })); // Show preview

    if (!formData.tuuid) {
      setError('Please close and reopen the form to try again.');
      return;
    }

    try {
      setUploadingImage(imageField);
      setError('');

      const cleanTuuid = formData.tuuid.trim().replace(/^\/|\/$/g, '');
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('truckimages')
        .list(cleanTuuid);

      let filesToCleanup: string[] = [];
      if (!listError && existingFiles) {
        filesToCleanup = existingFiles
          .filter(f => f.name.startsWith(`${imageField}.`))
          .map(f => `${cleanTuuid}/${f.name}`);
      }

      // Fallback cleanup using exact URL path
      const currentUrl = formData[imageField as keyof typeof formData] as string;
      if (currentUrl && currentUrl.includes('/truckimages/')) {
        const urlParts = currentUrl.split('/truckimages/');
        if (urlParts.length > 1) {
          const urlPath = urlParts[1].split('?')[0];
          if (!filesToCleanup.includes(urlPath)) {
            filesToCleanup.push(urlPath);
          }
        }
      }

      if (filesToCleanup.length > 0) {
        await supabase.storage.from('truckimages').remove(filesToCleanup);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${imageField}.${fileExt}`;
      const filePath = `${cleanTuuid}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('truckimages')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('truckimages')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, [imageField]: publicUrl }));
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Failed to upload image: ${err.message}`);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleRemoveImage = async (imageField: string) => {
    if (!formData.tuuid) return;

    try {
      setUploadingImage(imageField);
      const cleanTuuid = formData.tuuid.trim().replace(/^\/|\/$/g, '');
      let filesToCleanup: string[] = [];

      const currentUrl = formData[imageField as keyof typeof formData] as string;
      if (currentUrl && currentUrl.includes('/truckimages/')) {
        const urlParts = currentUrl.split('/truckimages/');
        if (urlParts.length > 1) {
          const urlPath = urlParts[1].split('?')[0];
          filesToCleanup.push(urlPath);
        }
      }

      const { data: files, error: listError } = await supabase.storage
        .from('truckimages')
        .list(cleanTuuid);

      if (!listError && files) {
        files.forEach(f => {
          if (f.name.startsWith(`${imageField}.`)) {
            const path = `${cleanTuuid}/${f.name}`;
            if (!filesToCleanup.includes(path)) {
              filesToCleanup.push(path);
            }
          }
        });
      }

      if (filesToCleanup.length > 0) {
        const { error: removeError } = await supabase.storage
          .from('truckimages')
          .remove(filesToCleanup);
        if (removeError) throw removeError;
      }

      setFormData(prev => ({ ...prev, [imageField]: '' }));
    } catch (err: any) {
      console.error('Removal error:', err);
      setFormData(prev => ({ ...prev, [imageField]: '' }));
      setError(`Notice: Image cleared from form. Storage cleanup result: ${err.message || 'Check console'}`);
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

      const finalFeatures = featuresInput
        .split(/,|\n/)
        .map(f => f.trim())
        .filter(f => f !== '')
        .slice(0, 20);

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
        image3: formData.image3,
        image4: formData.image4,
        image5: formData.image5,
        image6: formData.image6,
        image7: formData.image7,
        image8: formData.image8,
        image9: formData.image9,
        features: finalFeatures,
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
      console.error('Detailed Save Error:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
        fullError: err
      });

      let errorMsg = 'Could not save the truck details.';
      if (err.message) {
        errorMsg += ` Reason: ${err.message}`;
        if (err.details) errorMsg += ` (${err.details})`;
      }

      if (err.code === '42703') {
        errorMsg = 'Database Error: The "features" column might be missing. Please ensure you have added the features column to your "trucks" table in Supabase.';
      }

      setError(errorMsg);
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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { id: 'main_image', label: 'Main' },
                { id: 'image1', label: 'Img 1' },
                { id: 'image2', label: 'Img 2' },
                { id: 'image3', label: 'Img 3' },
                { id: 'image4', label: 'Img 4' },
                { id: 'image5', label: 'Img 5' },
                { id: 'image6', label: 'Img 6' },
                { id: 'image7', label: 'Img 7' },
                { id: 'image8', label: 'Img 8' },
                { id: 'image9', label: 'Img 9' }
              ].map((img) => (
                <div key={img.id} className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">{img.label}</label>
                  <div className="relative group aspect-square">
                    {formData[img.id as keyof typeof formData] ? (
                      <>
                        <img
                          src={formData[img.id as keyof typeof formData] as string}
                          alt={img.label}
                          className="w-full h-full object-cover rounded-xl border border-slate-700"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                          <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                            <Upload className="w-4 h-4 text-white" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, img.id)}
                              disabled={uploadingImage !== null}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                            disabled={uploadingImage !== null}
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className={`
                      flex flex-col items-center justify-center w-full h-full
                      border-2 border-dashed rounded-xl cursor-pointer
                      transition-all duration-200
                      ${isDark
                          ? 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50'
                          : 'border-gray-200 hover:border-cyan-500/50 hover:bg-gray-50'
                        }
                      ${uploadingImage === img.id ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                        {uploadingImage === img.id ? (
                          <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                        ) : (
                          <>
                            <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500">Add</span>
                          </>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, img.id)}
                          disabled={uploadingImage !== null}
                        />
                      </label>
                    )}
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
              <label className={labelClass}>Price (£)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                min="0"
                step="1"
                className={inputClass}
                placeholder="0"
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

          {/* Features */}
          <div>
            <label className={labelClass}>
              Key Features
              <span className={`ml-2 text-xs font-normal ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                (Enter features separated by commas or one per line - Max 20)
              </span>
            </label>
            <textarea
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              rows={5}
              placeholder="e.g., Air bag, Radio, ABS, Climate Control..."
              className={inputClass}
            />
            {featuresInput.trim() !== '' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {featuresInput.split(/,|\n/).map(f => f.trim()).filter(f => f !== '').slice(0, 20).map((feature, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-cyan-400 border border-slate-600' : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                      }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
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
