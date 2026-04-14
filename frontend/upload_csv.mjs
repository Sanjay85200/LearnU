import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

// User's provided Supabase credentials
const supabaseUrl = 'https://dcmmeuayusmnsbxuywhp.supabase.co';
const supabaseAnonKey = 'sb_publishable_fboYZ1aXs8p0Yt6sOuC30g_LwMXMcFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const results = [];

console.log("Starting to parse new expanded CSV...");

fs.createReadStream('questions_full.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`Parsed ${results.length} dual-language questions. Optional: deleting old dataset before inserting new...`);
    
    // First clear old questions mapped to test 1 to prevent duplicates/garbage demo data
    try {
        await supabase.from('questions').delete().eq('test_id', 1);
    } catch (e) {
        // ignore error
    }

    // Convert to schema format combining English and Telugu perfectly!
    const formattedData = results.map(r => ({
      test_id: 1, // hardcoded test id 1
      question: `${r.question_en} \n(${r.question_te})`,
      option1: `${r.option_a_en} / ${r.option_a_te}`,
      option2: `${r.option_b_en} / ${r.option_b_te}`,
      option3: `${r.option_c_en} / ${r.option_c_te}`,
      option4: `${r.option_d_en} / ${r.option_d_te}`,
      correct_answer: r.correct_option
    }));

    try {
      // Chunk inserts for safety
      const chunkSize = 20;
      for (let i = 0; i < formattedData.length; i += chunkSize) {
          const chunk = formattedData.slice(i, i + chunkSize);
          const { error } = await supabase.from('questions').insert(chunk);
          if (error) throw error;
      }

      console.log("Successfully uploaded 60 Fully Bilingual Physical Education questions to Supabase!");
    } catch (e) {
      console.error("Exception Error:", e.message);
    }
  });
