# 🎓 Student & Faculty Portal – SRM Placement & Attendance System

A full-featured web portal built using **Next.js**, **Tailwind CSS**, and **Firebase** to simplify and automate several workflows between students, faculty, and academic administrators.

This project aims to eliminate manual processes around placement tracking, attendance verification, and student communication — making life easier for both students and teachers.

---

## 🚀 Features

### 👨‍🎓 Student Portal:
- **Profile Management**: Students can update their personal details, academic info, and placement matrix data.
- **Placement Matrix Scoring**: Automatic calculation of placement matrix marks based on submitted data.
- **Achievements Section**: Add/update achievements (verified by Faculty Advisor).
- **Low Attendance Alerts**: View alerts from faculty and respond with reasons.
- **Approval Flow**: Responses verified by Faculty Advisor (FA) and Academic Advisor (AA) digitally.

### 👩‍🏫 Faculty Portal:
- **AI-Powered Attendance Upload**: Upload attendance PDFs with intelligent extraction using Google Gemini AI. The system automatically:
  - Extracts student data from PDFs (even with embedded/non-copyable text)
  - Handles large PDFs with intelligent chunking (10 students per chunk)
  - Processes multiple chunks in parallel for speed
  - Provides real-time status updates during processing
  - Auto-populates attendance data to Firebase Firestore
- **Low Attendance Filtering**: Easily identify students with low attendance.
- **Email Alerts**: Send alert emails to students and parents with one click.
- **Verify Updates**: Approve/reject students' placement or achievement updates from the dashboard.

---

## 🛠 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), React
- **Backend**: [Firebase Auth](https://firebase.google.com/products/auth), [Cloud Firestore](https://firebase.google.com/products/firestore)
- **AI/ML**: [Google Gemini API](https://ai.google.dev/) (Gemini 2.5 Flash & Pro models)
- **Other Tools**: jsPDF, autoTable, Resend (email service), Google Drive integration

---

## 📸 Screenshots

_Add relevant screenshots or UI GIFs here to visually showcase the portal._

---

## 📂 Folder Structure

```
SRMproject/
├── app/
│   ├── api/
│   │   ├── upload-attendance/
│   │   │   └── route.js          # Main attendance upload API with Gemini AI
│   │   ├── upload-attendance-status/
│   │   │   └── route.js          # Real-time status polling endpoint
│   │   ├── get-attendance/
│   │   │   └── route.js          # Fetch attendance data
│   │   └── ...                   # Other API routes
│   ├── components/
│   │   └── Upload-Attendance/
│   │       └── IntegratedAttendanceUploadApp.jsx  # Attendance upload UI
│   ├── attendance-upload/
│   │   └── page.jsx              # Attendance upload page route
│   └── ...                       # Other pages and components
├── lib/
│   ├── firebase-admin.js        # Firebase admin SDK setup
│   └── status-store.js          # In-memory job status store
├── .env.local                   # Environment variables (not committed)
└── README.md                    # This file
```

---

## 🔐 Environment Variables

Create a `.env.local` file in `SRMproject/` and populate it with the following variables:

### Required Variables

```bash
# Base64-encoded Firebase service account JSON
# This is used for server-side Firebase Admin SDK operations
FIREBASE_SERVICE_ACCOUNT_B64=REPLACE_WITH_BASE64_OF_SERVICE_ACCOUNT_JSON

# Comma-separated list of Gemini API keys (fallback order)
# Multiple keys provide redundancy if one hits rate limits
# Format: KEY1,KEY2,KEY3 (no spaces, just commas)
GEMINI_API_KEYS=AIzaSyExampleKey1,AIzaSyExampleKey2,AIzaSyExampleKey3
```

### Optional Variables

```bash
# Comma-separated list of Gemini models in fallback order
# Defaults if omitted: gemini-2.5-flash, gemini-2.5-pro
# Flash model is prioritized for speed, Pro for accuracy
GEMINI_MODELS=gemini-2.5-flash,gemini-2.5-pro
```

### How to Generate Base64 Service Account

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\serviceAccountKey.json"))
```

**Linux/macOS:**
```bash
cat serviceAccountKey.json | base64 -w 0
```

**Node.js (alternative):**
```javascript
const fs = require('fs');
const base64 = fs.readFileSync('serviceAccountKey.json').toString('base64');
console.log(base64);
```

### Getting Gemini API Keys

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)
4. Add multiple keys to `GEMINI_API_KEYS` for redundancy

**Important**: 
- Place your newest/primary API key **first** in the comma-separated list
- The system will automatically filter out invalid or placeholder keys
- Keys must start with `AIza` and be at least 10 characters long

---

## 🤖 AI-Powered Attendance Upload System

### Overview

The attendance upload system uses **Google Gemini AI** to extract student attendance data from PDF files. This is particularly useful when PDFs contain embedded text that cannot be copied or extracted using traditional methods.

### Architecture

The system implements a **2-phase chunking strategy** with **parallel processing** and **multi-level fallback** for maximum reliability and speed:

#### Phase 1: Analyze
- **Purpose**: Determine total number of students and extract first chunk
- **Chunk Size**: 10 students (S.No 1-10)
- **Returns**: 
  - `totalStudentCount`: Total students in the PDF
  - `rows`: First 10 students' data

#### Phase 2: Parallel Fetch
- **Purpose**: Fetch remaining student data in parallel
- **Chunk Size**: 10 students per chunk
- **Processing**: All remaining chunks are fetched simultaneously using `Promise.allSettled()`
- **Key Fallback**: Each chunk tries all API keys before failing
- **Result**: All student data aggregated before database write

### Fallback Strategy

The system implements a **3-level failsafe** mechanism:

1. **Model Fallback**: 
   - Primary: `gemini-2.5-flash` (fast)
   - Fallback: `gemini-2.5-pro` (accurate)
   - Automatically switches if model unavailable (404) or rate limited (429)

2. **API Key Fallback**:
   - Tries all configured API keys in order
   - Switches to next key on rate limit (429) or quota exhaustion
   - Each chunk tries all keys independently

3. **Error Resilience**:
   - Individual chunk failures don't stop the entire process
   - Failed chunks are logged but processing continues
   - Partial success is acceptable (some chunks may fail)

### Real-Time Status Updates

The frontend polls the status endpoint every 500ms to provide real-time feedback:

- **Status Messages**: "Running Model Pipeline...", "Phase 1: Analyzing PDF...", etc.
- **Status History**: Complete log of all processing steps
- **Job Tracking**: Each upload gets a unique `jobId` for status tracking

### Database Updates

- **Firebase Batch Writes**: All student records written atomically using Firestore batch operations
- **Batch Limit Handling**: Automatically splits large batches (500 operations max) into multiple batches
- **Atomic Operations**: Ensures data consistency even with partial failures

### Processing Flow

```
1. User uploads PDF
   ↓
2. PDF converted to base64
   ↓
3. Phase 1: Analyze call
   - Extract first 10 students
   - Get total student count
   ↓
4. Phase 2: Calculate remaining chunks
   ↓
5. Create parallel fetch promises for all chunks
   ↓
6. Execute all chunks in parallel (Promise.allSettled)
   - Each chunk tries all API keys
   - Each key tries all models
   ↓
7. Aggregate all successful chunks
   ↓
8. Batch write to Firestore
   ↓
9. Return success response
```

### Configuration

#### Chunk Size
- **Current**: 10 students per chunk
- **Reason**: Balances token limits (8192 max) with processing speed
- **Adjustable**: Modify `CHUNK_SIZE` constant in `route.js`

#### Model Priority
- **Primary**: `gemini-2.5-flash` (faster, lower cost)
- **Fallback**: `gemini-2.5-pro` (more accurate, higher cost)
- **Configurable**: Set via `GEMINI_MODELS` environment variable

#### API Request Configuration
- **maxOutputTokens**: 8192 (ensures complete JSON responses)
- **temperature**: 0 (deterministic, precise extraction)
- **API Version**: v1beta (with automatic fallback to v1)

---

## 📡 API Endpoints

### Attendance Upload

#### **POST `/api/upload-attendance`**
Uploads an attendance PDF and processes it using Gemini AI.

**Request:**
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `pdf` (File, required): The attendance PDF file
  - `jobId` (string, optional): Unique job identifier for status tracking

**Response (Success):**
```json
{
  "success": true,
  "message": "Attendance data uploaded successfully",
  "totalStudents": 61,
  "chunksProcessed": 7,
  "chunksSucceeded": 7,
  "chunksFailed": 0
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad request (no PDF, invalid format)
- `500`: Server error (API failure, processing error)

#### **GET `/api/upload-attendance-status`**
Retrieves real-time status of an ongoing upload job.

**Request:**
- **Method**: `GET`
- **Query Parameters**:
  - `jobId` (string, required): The job identifier

**Response:**
```json
{
  "status": "Phase 2: Fetching remaining 6 chunk(s) in parallel...",
  "history": [
    {
      "message": "🔄 Running Model Pipeline...",
      "timestamp": 1234567890,
      "type": "info"
    },
    {
      "message": "✅ Phase 1 complete: Found 61 total students",
      "timestamp": 1234567891,
      "type": "success"
    }
  ]
}
```

**Status Types:**
- `info`: Informational message
- `success`: Successful operation
- `warning`: Warning message
- `error`: Error message

### Attendance Retrieval

#### **GET `/api/get-attendance`**
Fetches attendance data for a specific student.

**Request:**
- **Method**: `GET`
- **Query Parameters**:
  - `regNo` (string, required): Student registration number

**Response:**
```json
{
  "success": true,
  "attendanceMap": {
    "21MAB201T(A)": 82.5,
    "21CSC201J(B)": 96.88,
    "21CSS201T(C)": 90.0
  }
}
```

---

## 🔧 How It Works: Step-by-Step

### For Faculty Users

1. **Navigate to Attendance Upload**
   - Go to Admin Dashboard → Click "Upload Attendance"
   - Or directly visit `/attendance-upload`

2. **Upload PDF**
   - Drag & drop PDF or click to browse
   - System validates file type (must be PDF)

3. **Processing Begins**
   - PDF is uploaded and converted to base64
   - Real-time status updates appear in the UI
   - Status messages show:
     - "Running Model Pipeline..."
     - "Phase 1: Analyzing PDF..."
     - "Phase 2: Fetching remaining chunks..."
     - Progress indicators

4. **Completion**
   - Success message displayed
   - All student data populated to Firestore
   - Redirect to dashboard or upload another

### Technical Flow

1. **Frontend** (`IntegratedAttendanceUploadApp.jsx`):
   - User selects PDF file
   - Creates unique `jobId`
   - Starts polling `/api/upload-attendance-status`
   - POSTs PDF to `/api/upload-attendance`

2. **Backend** (`/api/upload-attendance/route.js`):
   - Receives PDF and converts to base64
   - Loads API keys and models from environment
   - **Phase 1**: Makes analyze call to Gemini
   - **Phase 2**: Creates parallel fetch promises
   - Executes all chunks with key fallback
   - Aggregates results
   - Batch writes to Firestore
   - Updates status throughout

3. **Status Store** (`lib/status-store.js`):
   - In-memory store for job statuses
   - Keyed by `jobId`
   - Updated by backend, read by status endpoint

4. **Firebase** (`lib/firebase-admin.js`):
   - Batch writes student records
   - Each record: `{ regNo, name, subjects: { code: percentage } }`
   - Atomic operations ensure consistency

---

## 🐛 Troubleshooting

### Common Issues

#### "No valid API keys found"
**Cause**: Invalid or placeholder API keys in environment
**Solution**:
- Check `.env.local` has `GEMINI_API_KEYS` set
- Ensure keys start with `AIza` and are at least 10 characters
- Remove any placeholder text like "REPLACE_WITH..."

#### "All models rate limited"
**Cause**: API rate limits exceeded
**Solution**:
- Add more API keys to `GEMINI_API_KEYS`
- Wait a few minutes before retrying
- Check Google AI Studio for quota limits

#### "JSON parsing failed: Unexpected end of JSON input"
**Cause**: Response truncated (usually token limit)
**Solution**:
- Already handled: chunk size is set to 10 to prevent this
- If still occurs, reduce `CHUNK_SIZE` further

#### "Model not found for API version"
**Cause**: Model name incorrect or unavailable
**Solution**:
- Check `GEMINI_MODELS` uses correct model names
- System automatically falls back to v1 API if v1beta fails
- Default models (`gemini-2.5-flash`, `gemini-2.5-pro`) should work

#### "All API keys failed for this chunk"
**Cause**: All keys exhausted for a specific chunk
**Solution**:
- Add more API keys
- Check individual key quotas in Google AI Studio
- Some chunks may fail, but others will succeed

### Debugging Tips

1. **Check Server Logs**:
   - All processing steps are logged with `[upload-attendance]` prefix
   - Look for error messages and status updates

2. **Monitor Status Endpoint**:
   - Poll `/api/upload-attendance-status?jobId=YOUR_JOB_ID`
   - Check status history for detailed progress

3. **Verify Environment Variables**:
   ```bash
   # Check if variables are loaded
   console.log(process.env.GEMINI_API_KEYS)
   ```

4. **Test Individual Components**:
   - Test PDF conversion: Check base64 length
   - Test API keys: Try calling Gemini directly
   - Test Firebase: Verify service account permissions

---

## 📬 Contact

For questions, collaborations, or feedback:  
[LinkedIn](https://www.linkedin.com/in/yash-dingar-946688276/)

---

## 📃 License

This project is built for educational and internal use at **SRM Institute of Science & Technology**.
