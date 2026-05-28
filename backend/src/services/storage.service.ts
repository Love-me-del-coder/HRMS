import { createClient } from '@supabase/supabase-js';

// We require the user to put these in .env later. If missing, we'll log a warning.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY is missing. File uploads will fail unless added to .env.');
}

export const uploadFileToStorage = async (
  bucket: string, 
  filePath: string, 
  fileBuffer: Buffer, 
  mimetype: string
): Promise<string> => {
  if (!supabase) throw new Error('Supabase client not initialized. Check .env');

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: mimetype,
      upsert: true
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};
