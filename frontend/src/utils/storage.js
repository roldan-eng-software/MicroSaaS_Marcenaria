import { supabase } from '../lib/supabase';

/**
 * Uploads a file to a specific Supabase bucket.
 * @param {File} file - The file object to upload.
 * @param {string} bucket - The name of the bucket (photos, documents).
 * @param {string} folder - Optional folder name (e.g., visits, quotes).
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(file, bucket, folder = '') {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get the Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            path: data.path
        };
    } catch (error) {
        console.error('Error in uploadFile:', error);
        throw error;
    }
}

/**
 * Deletes a file from Supabase storage.
 * @param {string} bucket 
 * @param {string} path 
 */
export async function deleteFile(bucket, path) {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}
