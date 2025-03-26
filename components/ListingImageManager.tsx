import { useState, useEffect } from 'react';
import { ListingImage, useListingImages } from '@/hooks/use-listing-images';
import { ImageUpload } from '@/components/ImageUpload';
import { 
  Trash2, 
  Star, 
  StarOff, 
  AlertCircle, 
  Plus, 
  Image as ImageIcon,
  Loader2,
  Edit,
  X,
  Check
} from 'lucide-react';

interface ListingImageManagerProps {
  listingId?: string;
  onImagesChange?: (images: ListingImage[]) => void;
}

export function ListingImageManager({ listingId, onImagesChange }: ListingImageManagerProps) {
  const {
    images,
    loading,
    error,
    addImage,
    updateImage,
    deleteImage,
    setPrimaryImage
  } = useListingImages(listingId);

  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [captionEn, setCaptionEn] = useState<string>('');
  const [captionAr, setCaptionAr] = useState<string>('');

  // Pass images up to parent component when they change
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images);
    }
  }, [images, onImagesChange]);

  const handleImageUploaded = async (url: string) => {
    if (!listingId) {
      console.error('ListingId is required to upload images');
      return;
    }

    await addImage({
      image_url: url,
      listing_id: listingId,
      caption_en: '',
      caption_ar: '',
      is_primary: images.length === 0 // Make first image primary
    });
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteImage(id);
    }
  };

  const handleSetPrimary = async (id: string) => {
    await setPrimaryImage(id);
  };

  const startEditing = (image: ListingImage) => {
    setEditingImageId(image.id!);
    setCaptionEn(image.caption_en);
    setCaptionAr(image.caption_ar);
  };

  const cancelEditing = () => {
    setEditingImageId(null);
    setCaptionEn('');
    setCaptionAr('');
  };

  const saveEditing = async () => {
    if (editingImageId) {
      await updateImage(editingImageId, {
        caption_en: captionEn,
        caption_ar: captionAr
      });
      cancelEditing();
    }
  };

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>Error loading images: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">Listing Images</h3>
        <p className="text-sm text-muted-foreground">
          Add images to showcase your listing. The first image or image marked as primary will be used as the main thumbnail.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading images...</span>
        </div>
      )}

      {/* Image upload area */}
      <div className="border border-dashed border-gray-300 rounded-md p-4">
        <ImageUpload 
          onImageUploaded={handleImageUploaded} 
          storagePath="listing_images" 
        />
      </div>

      {/* Images grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {images.map((image) => (
          <div key={image.id} className="border rounded-md overflow-hidden bg-card">
            {/* Image preview */}
            <div className="relative aspect-video bg-muted">
              <img 
                src={image.image_url} 
                alt={image.caption_en} 
                className="w-full h-full object-cover"
              />
              {/* Primary badge */}
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-medium">
                  Primary
                </div>
              )}
            </div>

            {/* Image editing section */}
            {editingImageId === image.id ? (
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">English Caption</label>
                  <input
                    type="text"
                    value={captionEn}
                    onChange={(e) => setCaptionEn(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter English caption"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Arabic Caption</label>
                  <input
                    type="text"
                    value={captionAr}
                    onChange={(e) => setCaptionAr(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter Arabic caption"
                    dir="rtl"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={saveEditing}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3">
                {/* Caption display */}
                <div className="mb-2 min-h-[40px]">
                  {image.caption_en ? (
                    <p className="text-sm font-medium line-clamp-2">{image.caption_en}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No caption</p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex justify-between">
                  <div>
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(image.id!)}
                        className="btn btn-ghost btn-sm text-amber-600 hover:text-amber-700"
                        title="Set as primary image"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEditing(image)}
                      className="btn btn-ghost btn-sm"
                      title="Edit captions"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id!)}
                    className="btn btn-ghost btn-sm text-destructive hover:text-destructive/80"
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {!loading && images.length === 0 && (
          <div className="col-span-full border rounded-md p-8 text-center bg-muted/30">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-medium">No images yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Upload images to showcase your listing.</p>
          </div>
        )}
      </div>
    </div>
  );
} 