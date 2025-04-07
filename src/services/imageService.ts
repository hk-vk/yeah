import { supabase } from '../lib/supabase';

export interface StoredImage {
    id: string;
    analysis_id: string;
    storage_path: string;
    original_url: string | null;
    image_type: 'uploaded' | 'url' | 'extracted';
    created_at: string;
    updated_at: string;
}

export const imageService = {
    /**
     * Upload an image to Supabase storage and create a record in analysis_images
     */
    async uploadImage(
        file: File | Blob,
        analysisId: string,
        imageType: 'uploaded' | 'url' | 'extracted',
        originalUrl?: string
    ): Promise<StoredImage> {
        try {
            // Generate a unique filename
            const timestamp = new Date().getTime();
            const filename = `${analysisId}_${timestamp}.${file.type.split('/')[1] || 'jpg'}`;
            const storagePath = `${analysisId}/${filename}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('analysis-images')
                .upload(storagePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                throw uploadError;
            }

            // Create record in analysis_images table
            const { data: imageRecord, error: dbError } = await supabase
                .from('analysis_images')
                .insert({
                    analysis_id: analysisId,
                    storage_path: storagePath,
                    original_url: originalUrl || null,
                    image_type: imageType
                })
                .select()
                .single();

            if (dbError) {
                console.error('Error creating image record:', dbError);
                throw dbError;
            }

            return imageRecord as StoredImage;
        } catch (error) {
            console.error('Error in uploadImage:', error);
            throw error;
        }
    },

    /**
     * Store a URL-based image reference
     */
    async storeImageUrl(
        url: string,
        analysisId: string,
        imageType: 'url' | 'extracted'
    ): Promise<StoredImage> {
        try {
            // For URL-based images, we store the URL directly
            const { data: imageRecord, error: dbError } = await supabase
                .from('analysis_images')
                .insert({
                    analysis_id: analysisId,
                    storage_path: '', // Empty for URL-based images
                    original_url: url,
                    image_type: imageType
                })
                .select()
                .single();

            if (dbError) {
                console.error('Error creating image record:', dbError);
                throw dbError;
            }

            return imageRecord as StoredImage;
        } catch (error) {
            console.error('Error in storeImageUrl:', error);
            throw error;
        }
    },

    /**
     * Get all images associated with an analysis
     */
    async getAnalysisImages(analysisId: string): Promise<StoredImage[]> {
        try {
            const { data: images, error } = await supabase
                .from('analysis_images')
                .select('*')
                .eq('analysis_id', analysisId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching analysis images:', error);
                throw error;
            }

            return images as StoredImage[];
        } catch (error) {
            console.error('Error in getAnalysisImages:', error);
            throw error;
        }
    },

    /**
     * Get a signed URL for an image in storage
     */
    async getImageUrl(storagePath: string): Promise<string> {
        try {
            const { data: { publicUrl }, error } = await supabase.storage
                .from('analysis-images')
                .getPublicUrl(storagePath);

            if (error) {
                console.error('Error getting image URL:', error);
                throw error;
            }

            return publicUrl;
        } catch (error) {
            console.error('Error in getImageUrl:', error);
            throw error;
        }
    }
}; 