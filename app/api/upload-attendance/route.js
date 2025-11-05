import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import { updateStatus, clearStatus } from '../../../lib/status-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function readPdfFromFormData(request) {
  console.log('[upload-attendance] 📄 Starting PDF upload processing...');
  const form = await request.formData();
  const file = form.get('pdf');
  const jobId = form.get('jobId');
  
  if (!file) {
    console.error('[upload-attendance] ❌ No PDF file found in form data');
    throw new Error('No PDF uploaded');
  }
  
  if (jobId) {
    updateStatus(jobId, '📄 PDF received, processing...', 'info');
  }
  
  console.log(`[upload-attendance] 📎 PDF received: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB, type: ${file.type}`);
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  console.log(`[upload-attendance] ✅ PDF converted to base64 (${(base64.length / 1024).toFixed(2)} KB)`);
  
  if (jobId) {
    updateStatus(jobId, '✅ PDF processed, preparing AI model pipeline...', 'info');
  }
  
  return { base64, fileName: file.name || 'attendance.pdf', mimeType: file.type || 'application/pdf', jobId };
}

function getKeysAndModels() {
  const keysEnv = process.env.GEMINI_API_KEYS || '';
  const modelsEnv = process.env.GEMINI_MODELS || '';
  let apiKeys = keysEnv.split(',').map(k => k.trim()).filter(Boolean);
  
  // Filter out placeholder/invalid keys
  apiKeys = apiKeys.filter(key => {
    const isValid = key && 
                    key.length > 10 && 
                    !key.startsWith('REPLACE_') && 
                    !key.includes('REPLACE') &&
                    key.startsWith('AIza');
    if (!isValid) {
      console.warn(`[upload-attendance] ⚠️  Skipping invalid/placeholder API key: ${key.substring(0, 15)}...`);
    }
    return isValid;
  });
  
  console.log(`[upload-attendance] 🔑 Found ${apiKeys.length} valid API key(s) configured`);
  if (apiKeys.length > 0) {
    console.log(`[upload-attendance] 🔑 API keys (first key will be tried first): ${apiKeys.map(k => k.substring(0, 10) + '...').join(', ')}`);
    console.log(`[upload-attendance] 💡 Tip: Place your newest API key first in GEMINI_API_KEYS to use it first`);
  }
  
  // Default model fallback order: Flash model prioritized for speed
  const defaultModels = [
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];
  
  const models = modelsEnv 
    ? modelsEnv.split(',').map(m => m.trim()).filter(Boolean)
    : defaultModels;
  
  console.log(`[upload-attendance] 🤖 Model fallback order: ${models.join(' → ')}`);
    
  if (apiKeys.length === 0) {
    console.error('[upload-attendance] ❌ No valid API keys found. Please check GEMINI_API_KEYS environment variable.');
    throw new Error('No valid GEMINI_API_KEYS configured (found placeholders or invalid keys)');
  }
  return { apiKeys, models };
}

async function discoverModels(apiKey) {
  // Skip model discovery to avoid credential issues - use defaults instead
  console.log('[upload-attendance] ⚠️  Skipping model discovery (using configured defaults)');
  return [];
}

function buildAnalyzePrompt() {
  return `You are an information extraction engine for university attendance PDFs.
Extract attendance data for the FIRST 10 students (S.No 1 through S.No 10) from the PDF.

You MUST return two things:
1. The attendance data for the first 10 students
2. The TOTAL number of students in the entire document

Return ONLY valid JSON with the following schema. DO NOT use markdown code blocks, DO NOT wrap in \`\`\`json, return ONLY the raw JSON object:
{
  "totalStudentCount": <total_number_of_students_in_entire_document>,
  "rows": [
    {
      "regNo": "RAxxxxxxxxxxxxx",
      "name": "FULL CAPS NAME",
      "subjects": { "<SUBJECT_CODE>": <percentage_number>, ... }
    }
  ]
}
Notes:
- totalStudentCount must be the exact total number of students in the entire PDF document.
- rows must contain ONLY the first 10 students (S.No 1-10).
- regNo must be exactly the registration id in the PDF (e.g., RAxxxxxxxxxxxxx).
- name should be the full name as printed (uppercase if source is uppercase).
- subjects is a map where keys are subject codes exactly as in PDF (e.g., 21ABC123T, 21XYZ456) including any suffix like (A). Values are attendance percentages as numbers (e.g., 82.14).
- If a subject percentage is missing for a student, omit that subject key for that student.
- CRITICAL: Return ONLY the raw JSON object. No markdown, no code blocks, no \`\`\`json, no \`\`\`, no explanations. Just the JSON starting with { and ending with }.`;
}

function buildFetchPrompt(startSNo, endSNo) {
  return `You are an information extraction engine for university attendance PDFs.
Extract attendance data ONLY for students with S.No ${startSNo} through S.No ${endSNo} from the PDF.

Return ONLY valid JSON with the following schema. DO NOT use markdown code blocks, DO NOT wrap in \`\`\`json, return ONLY the raw JSON object:
{
  "rows": [
    {
      "regNo": "RAxxxxxxxxxxxxx",
      "name": "FULL CAPS NAME",
      "subjects": { "<SUBJECT_CODE>": <percentage_number>, ... }
    }
  ]
}
Notes:
- Extract ONLY students with S.No ${startSNo} through S.No ${endSNo}.
- regNo must be exactly the registration id in the PDF (e.g., RAxxxxxxxxxxxxx).
- name should be the full name as printed (uppercase if source is uppercase).
- subjects is a map where keys are subject codes exactly as in PDF (e.g., 21ABC123T, 21XYZ456) including any suffix like (A). Values are attendance percentages as numbers (e.g., 82.14).
- If a subject percentage is missing for a student, omit that subject key for that student.
- CRITICAL: Return ONLY the raw JSON object. No markdown, no code blocks, no \`\`\`json, no \`\`\`, no explanations. Just the JSON starting with { and ending with }.`;
}

async function callGemini({ apiKey, model, pdfBase64, fileName, mimeType, apiVersion = 'v1beta', jobId, prompt }) {
  console.log(`[upload-attendance] 🚀 Calling Gemini API with model: ${model}`);
  
  if (jobId) {
    updateStatus(jobId, `🤖 Calling model: ${model}...`, 'info');
  }
  
  try {
    if (!prompt) {
      throw new Error('Prompt is required for API call');
    }
    
    // Use direct REST API call to avoid credential lookup issues
    const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { data: pdfBase64, mimeType } }
        ]
      }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0
      }
    };
    
    // Verify generationConfig is properly nested before sending
    if (!requestBody.generationConfig || !requestBody.generationConfig.maxOutputTokens) {
      console.error('[upload-attendance] ❌ CRITICAL: generationConfig missing or malformed!');
      throw new Error('generationConfig not properly configured');
    }
    
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const duration = Date.now() - startTime;
    console.log(`[upload-attendance] 📥 Response received in ${duration}ms, status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[upload-attendance] ❌ HTTP error response:`, errorText.substring(0, 500));
      
      // If 404 with v1beta, retry with v1
      if (response.status === 404 && apiVersion === 'v1beta') {
        console.log(`[upload-attendance] ⚠️  Model not found in v1beta, retrying with v1 API...`);
        if (jobId) {
          updateStatus(jobId, `⚠️ Model not found in v1beta, trying v1 API...`, 'warning');
        }
        return await callGemini({ apiKey, model, pdfBase64, fileName, mimeType, apiVersion: 'v1', jobId });
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText.substring(0, 200)}`);
    }
    
    const result = await response.json();

    // Extract text robustly (handles multiple response structures)
    let text;
    try {
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = result.candidates[0].content.parts[0].text;
      } else if (result?.text) {
        text = result.text;
      } else {
        text = JSON.stringify(result);
      }
    } catch (textError) {
      console.error('[upload-attendance] ❌ Failed to extract text:', textError);
      throw new Error(`Failed to extract text from response: ${textError.message}`);
    }

    if (!text || !text.trim()) {
      console.error('[upload-attendance] ❌ Empty text extracted from response');
      throw new Error('Empty response from model');
    }

    // Clean the text: remove markdown code fences
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```\s*$/i, '');
    cleanedText = cleanedText.trim();

    // Parse JSON from response
    let json;
    try {
      // Try to find the JSON object - look for complete JSON
      let jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      // If no complete JSON found, try to find the start and manually complete if needed
      if (!jsonMatch) {
        const jsonStart = cleanedText.indexOf('{');
        if (jsonStart !== -1) {
          // Try to extract and complete the JSON
          let jsonCandidate = cleanedText.substring(jsonStart);
          // Try to find a closing brace that might complete the JSON
          const lastBrace = jsonCandidate.lastIndexOf('}');
          if (lastBrace !== -1) {
            jsonCandidate = jsonCandidate.substring(0, lastBrace + 1);
            jsonMatch = [jsonCandidate];
          }
        }
      }
      
      if (!jsonMatch || !jsonMatch[0]) {
        console.error('[upload-attendance] ❌ No JSON object found in response text');
        throw new Error("No valid JSON found in response");
      }
      
      json = JSON.parse(jsonMatch[0]);
      console.log('[upload-attendance] ✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('[upload-attendance] ❌ JSON parsing failed:', parseError.message);
      throw new Error(`Failed to parse JSON: ${parseError.message}. Response text: ${cleanedText.substring(0, 500)}`);
    }

    if (!json || !Array.isArray(json.rows)) {
      console.error('[upload-attendance] ❌ Invalid JSON structure - missing rows array');
      throw new Error('Model output missing rows array');
    }
    
    console.log(`[upload-attendance] ✅ Successfully extracted ${json.rows.length} student records`);
    if (jobId && json.totalStudentCount) {
      updateStatus(jobId, `✅ Found ${json.totalStudentCount} total students, extracted ${json.rows.length} records`, 'success');
    }
    
    // Return both rows and totalStudentCount (if present)
    return {
      rows: json.rows,
      totalStudentCount: json.totalStudentCount
    };
  } catch (error) {
    console.error(`[upload-attendance] ❌ Gemini API call failed for model ${model}:`, {
      error: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}

async function updateFirestore(rows) {
  console.log(`[upload-attendance] 💾 Starting Firestore batch update for ${rows.length} student records`);
  const subjectKeysSet = new Set();
  let skippedCount = 0;
  
  // Prepare all updates first
  const updates = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const regNo = String(row.regNo || '').trim();
    const name = String(row.name || '').trim();
    const subjects = row.subjects && typeof row.subjects === 'object' ? row.subjects : {};
    
    if (!regNo) {
      skippedCount++;
      continue;
    }
    
    const ref = adminDb.collection('User').doc(regNo);
    const attendanceMap = {};
    
    for (const [code, percent] of Object.entries(subjects)) {
      subjectKeysSet.add(code);
      const num = typeof percent === 'number' ? percent : parseFloat(String(percent));
      if (!Number.isFinite(num)) continue;
      attendanceMap[code] = num;
    }
    
    if (Object.keys(attendanceMap).length > 0) {
      // Prepare batch operations: set name/attendance structure, then update attendance fields
      updates.push({
        ref,
        name: name || undefined,
        attendanceMap
      });
    } else {
      skippedCount++;
    }
  }
  
  console.log(`[upload-attendance] 📝 Prepared ${updates.length} updates, ${skippedCount} skipped`);
  
  // Execute batch writes (Firestore limit: 500 operations per batch)
  const BATCH_SIZE = 500;
  let updatedCount = 0;
  
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = adminDb.batch();
    const batchUpdates = updates.slice(i, i + BATCH_SIZE);
    
    for (const update of batchUpdates) {
      // Set name and initialize attendance structure
      batch.set(update.ref, { name: update.name, attendance: {} }, { merge: true });
      
      // Update attendance fields
      const attendanceUpdates = Object.fromEntries(
        Object.entries(update.attendanceMap).map(([k, v]) => [`attendance.${k}`, v])
      );
      batch.update(update.ref, attendanceUpdates);
    }
    
    await batch.commit();
    updatedCount += batchUpdates.length;
    console.log(`[upload-attendance] ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} committed: ${batchUpdates.length} students`);
  }
  
  console.log(`[upload-attendance] 📊 Firestore update complete: ${updatedCount} updated, ${skippedCount} skipped, ${subjectKeysSet.size} unique subjects`);
  return { subjects: Array.from(subjectKeysSet) };
}

// Helper function to try API call with fallback
async function tryApiCallWithFallback({ apiKeys, models, pdfBase64, fileName, mimeType, jobId, prompt }) {
  let lastError = null;
  
  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
    const apiKey = apiKeys[keyIndex];
    
    if (jobId && keyIndex > 0) {
      updateStatus(jobId, `🔄 Rate limit exhausted, using fallback API key #${keyIndex + 1}...`, 'warning');
    }
    
    for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
      const modelName = models[modelIndex];
      
      if (jobId && modelIndex > 0) {
        updateStatus(jobId, `🔄 Calling fallback model ${modelIndex + 1}: ${modelName}...`, 'info');
      }
      
      try {
        const result = await callGemini({ 
          apiKey, 
          model: modelName, 
          pdfBase64, 
          fileName, 
          mimeType, 
          jobId, 
          prompt 
        });
        
        if (result && result.rows && result.rows.length > 0) {
          console.log(`[upload-attendance] ✅ SUCCESS! Model ${modelName} with Key #${keyIndex + 1} worked!`);
          return result;
        }
      } catch (modelError) {
        lastError = modelError;
        const errorStatus = modelError.status || modelError.error?.status || modelError.code || modelError.error?.code;
        const errorMessage = modelError.message || JSON.stringify(modelError.error || modelError);
        const errorMessageLower = errorMessage.toLowerCase();
        
        const is404 = errorStatus === 404 || errorStatus === 'NOT_FOUND' || 
                     errorMessage.includes('404') || 
                     errorMessage.includes('not found') ||
                     errorMessageLower.includes('not found for api version');
        
        const is429 = errorStatus === 429 || 
                     errorStatus === 'RESOURCE_EXHAUSTED' ||
                     (errorMessage.includes('429') && !errorMessage.includes('404')) ||
                     (errorMessageLower.includes('rate limit') && !errorMessageLower.includes('not found')) ||
                     (errorMessageLower.includes('quota') && !errorMessageLower.includes('not found'));
        
        const hasMoreModels = modelIndex < models.length - 1;
        const hasMoreKeys = keyIndex < apiKeys.length - 1;

        if (is429 && hasMoreKeys) {
          if (jobId) {
            updateStatus(jobId, `⚠️ Rate limit exhausted, switching to fallback API key...`, 'warning');
          }
          break; // Try next key
        }

        if ((is404 || is429) && hasMoreModels) {
          if (jobId) {
            updateStatus(jobId, `⚠️ ${is404 ? 'Model not found' : 'Rate limited'}, trying fallback model...`, 'warning');
          }
          continue; // Try next model
        } else if (hasMoreModels) {
          continue; // Try next model
        } else if (hasMoreKeys) {
          break; // Try next key
        } else {
          if (is429) {
            throw new Error('All models rate limited. Please wait and try again later.');
          }
          throw modelError;
        }
      }
    }
  }
  
  throw lastError || new Error('All model/key attempts failed');
}

// Key-aware fetch helper for chunks - tries all API keys before failing
async function fetchChunkWithKeyFallback({ prompt, apiKeys, models, pdfBase64, fileName, mimeType }) {
  let lastError = null;
  
  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
    const apiKey = apiKeys[keyIndex];
    
    try {
      // Try this key with all models
      const result = await tryApiCallWithFallback({
        apiKeys: [apiKey], // Pass only this key
        models,
        pdfBase64,
        fileName,
        mimeType,
        jobId: null, // No status updates for parallel chunks
        prompt
      });
      
      if (result && result.rows && result.rows.length > 0) {
        console.log(`[upload-attendance] ✅ Chunk fetch succeeded with API key #${keyIndex + 1}`);
        return result;
      }
    } catch (error) {
      lastError = error;
      const errorStatus = error.status || error.error?.status || error.code || error.error?.code;
      const errorMessage = error.message || JSON.stringify(error.error || error);
      const errorMessageLower = errorMessage.toLowerCase();
      
      // Check if it's a rate limit or quota error
      const is429 = errorStatus === 429 || 
                   errorStatus === 'RESOURCE_EXHAUSTED' ||
                   (errorMessage.includes('429') && !errorMessage.includes('404')) ||
                   (errorMessageLower.includes('rate limit') && !errorMessageLower.includes('not found')) ||
                   (errorMessageLower.includes('quota') && !errorMessageLower.includes('not found'));
      
      const hasMoreKeys = keyIndex < apiKeys.length - 1;
      
      if ((is429 || errorMessageLower.includes('quota')) && hasMoreKeys) {
        console.log(`[upload-attendance] ⚠️  API Key #${keyIndex + 1} failed or is exhausted, trying next key...`);
        continue; // Try next key
      } else if (hasMoreKeys) {
        // Non-rate-limit error, but try next key anyway
        console.log(`[upload-attendance] ⚠️  API Key #${keyIndex + 1} failed, trying next key...`);
        continue;
      } else {
        // Last key, will throw below
        break;
      }
    }
  }
  
  // All keys failed
  throw lastError || new Error('All API keys failed for this chunk');
}

export async function POST(request) {
  let jobId = null;
  try {
    console.log('[upload-attendance] ============================================');
    console.log('[upload-attendance] 🎯 Starting attendance upload processing');
    console.log('[upload-attendance] ============================================');
    
    const result = await readPdfFromFormData(request);
    const { base64, fileName, mimeType } = result;
    jobId = result.jobId;
    
    if (jobId) {
      updateStatus(jobId, '🔄 Running Model Pipeline...', 'info');
    }
    
    const { apiKeys, models: defaultModels } = getKeysAndModels();
    
    if (jobId) {
      updateStatus(jobId, `🔑 Found ${apiKeys.length} API key(s), ${defaultModels.length} model(s) configured`, 'info');
    }

    // ========== PHASE 1: Analyze Call ==========
    if (jobId) {
      updateStatus(jobId, '📊 Phase 1: Analyzing PDF to get total student count...', 'info');
    }
    console.log('[upload-attendance] 📊 Phase 1: Making analyze call to get total student count');
    
    const analyzePrompt = buildAnalyzePrompt();
    const analyzeResult = await tryApiCallWithFallback({
      apiKeys,
      models: defaultModels,
      pdfBase64: base64,
      fileName,
      mimeType,
      jobId,
      prompt: analyzePrompt
    });
    
    if (!analyzeResult.totalStudentCount) {
      throw new Error('Phase 1 failed: totalStudentCount not found in response');
    }
    
    const totalStudentCount = analyzeResult.totalStudentCount;
    let allStudents = [...analyzeResult.rows];
    
    console.log(`[upload-attendance] ✅ Phase 1 complete: Found ${totalStudentCount} total students, extracted ${allStudents.length} in first chunk`);
    if (jobId) {
      updateStatus(jobId, `✅ Phase 1 complete: Found ${totalStudentCount} total students`, 'success');
    }

    // ========== PHASE 2: Parallel Fetch Remaining Chunks ==========
    const CHUNK_SIZE = 10;
    const totalChunks = Math.ceil(totalStudentCount / CHUNK_SIZE);
    
    if (totalChunks > 1) {
      if (jobId) {
        updateStatus(jobId, `📥 Phase 2: Fetching remaining ${totalChunks - 1} chunk(s) in parallel...`, 'info');
      }
      console.log(`[upload-attendance] 📥 Phase 2: Preparing ${totalChunks - 1} parallel fetch calls with key fallback`);
      
      // Build array of prompts for all remaining chunks
      const chunkPromises = [];
      for (let chunkIndex = 2; chunkIndex <= totalChunks; chunkIndex++) {
        const startSNo = (chunkIndex - 1) * CHUNK_SIZE + 1;
        const endSNo = Math.min(chunkIndex * CHUNK_SIZE, totalStudentCount);
        const fetchPrompt = buildFetchPrompt(startSNo, endSNo);
        
        console.log(`[upload-attendance] 📝 Prepared chunk ${chunkIndex}/${totalChunks}: S.No ${startSNo}-${endSNo}`);
        
        // Create promise for this chunk with key fallback
        const chunkPromise = fetchChunkWithKeyFallback({
          prompt: fetchPrompt,
          apiKeys,
          models: defaultModels,
          pdfBase64: base64,
          fileName,
          mimeType
        }).then(result => ({
          chunkIndex,
          startSNo,
          endSNo,
          result,
          success: true
        })).catch(error => ({
          chunkIndex,
          startSNo,
          endSNo,
          error,
          success: false
        }));
        
        chunkPromises.push(chunkPromise);
      }
      
      // Execute all fetch calls in parallel
      if (jobId) {
        updateStatus(jobId, `⚡ Executing ${chunkPromises.length} parallel API calls...`, 'info');
      }
      console.log(`[upload-attendance] ⚡ Executing ${chunkPromises.length} parallel fetch calls...`);
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      // Process results
      let successCount = 0;
      let failureCount = 0;
      
      for (const settledResult of chunkResults) {
        if (settledResult.status === 'fulfilled') {
          const chunkData = settledResult.value;
          if (chunkData.success && chunkData.result && chunkData.result.rows && chunkData.result.rows.length > 0) {
            allStudents = [...allStudents, ...chunkData.result.rows];
            console.log(`[upload-attendance] ✅ Chunk ${chunkData.chunkIndex}/${totalChunks} (S.No ${chunkData.startSNo}-${chunkData.endSNo}) complete: ${chunkData.result.rows.length} students`);
            successCount++;
          } else if (!chunkData.success) {
            // API call failed
            console.error(`[upload-attendance] ❌ Chunk ${chunkData.chunkIndex}/${totalChunks} (S.No ${chunkData.startSNo}-${chunkData.endSNo}) failed:`, chunkData.error?.message || 'Unknown error');
            failureCount++;
          } else {
            // API call succeeded but returned no rows
            console.warn(`[upload-attendance] ⚠️  Chunk ${chunkData.chunkIndex}/${totalChunks} returned no students`);
            failureCount++;
          }
        } else {
          // Promise itself was rejected (shouldn't happen, but handle it)
          console.error(`[upload-attendance] ❌ Chunk promise rejected:`, settledResult.reason);
          failureCount++;
        }
      }
      
      console.log(`[upload-attendance] ✅ Parallel fetch complete: ${successCount} succeeded, ${failureCount} failed`);
      if (jobId) {
        updateStatus(jobId, `✅ Parallel fetch complete: ${successCount} chunks succeeded, ${failureCount} failed`, 'success');
      }
    }

    console.log(`[upload-attendance] ✅ All chunks complete: Total ${allStudents.length} students extracted`);
    if (jobId) {
      updateStatus(jobId, `✅ All chunks complete: ${allStudents.length} students extracted`, 'success');
    }

    // ========== Firebase Batch Write ==========
    if (jobId) {
      updateStatus(jobId, `💾 Updating database with ${allStudents.length} student records...`, 'info');
    }
    
    console.log(`[upload-attendance] 💾 Updating Firestore with ${allStudents.length} student records using batch writes...`);
    const { subjects } = await updateFirestore(allStudents);
    console.log(`[upload-attendance] ✅ Firestore batch update complete: ${subjects.length} unique subjects`);
    
    if (jobId) {
      updateStatus(jobId, `✅ Successfully updated ${allStudents.length} student records with ${subjects.length} subjects!`, 'success');
      clearStatus(jobId);
    }
    
    console.log(`[upload-attendance] ============================================`);
    console.log(`[upload-attendance] 🎉 Upload complete!`);
    console.log(`[upload-attendance] ============================================`);
    
    return NextResponse.json({ success: true, updatedSubjects: subjects, totalStudents: allStudents.length });
  } catch (error) {
    console.error('[upload-attendance] ============================================');
    console.error('[upload-attendance] ❌ FATAL ERROR:', error);
    console.error('[upload-attendance] ============================================');
    
    if (jobId) {
      updateStatus(jobId, `❌ Error: ${error.message}`, 'error');
      clearStatus(jobId);
    }
    
    return NextResponse.json({ success: false, message: error.message || 'Failed to process PDF' }, { status: 500 });
  }
}

export async function GET() {
  // Simple health check
  return NextResponse.json({ ok: true });
}


