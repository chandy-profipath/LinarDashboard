import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://pelxkxjsqwxbfsfcesag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbHhreGpzcXd4YmZzZmNlc2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjM0MzYsImV4cCI6MjA4MTkzOTQzNn0._wdnvXbY7_e39QlEJAnHP5wFgV5ZQJTpt1G6dqx0q3I';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };