
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwbyqcycgoyslkrwowja.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3YnlxY3ljZ295c2xrcndvd2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzQwOTYsImV4cCI6MjA4MDcxMDA5Nn0.FAJ1Cfpkigry7tBbfWLPTH1UPmOU_lrTy2I4Ir6SSFo';

export const supabase = createClient(supabaseUrl, supabaseKey);
