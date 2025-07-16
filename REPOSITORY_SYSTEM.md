# RUNACOSS Repository System

A comprehensive multimedia repository system for academic materials with support for various file formats, advanced search capabilities, and robust file management.

## Features

### 🎥 Multimedia Support
- **Images**: JPG, PNG, GIF, BMP, SVG, WebP with dimension metadata
- **Videos**: MP4, AVI, MOV, WMV, FLV, WebM, MKV with duration, resolution, frame rate
- **Audio**: MP3, WAV, FLAC, AAC, OGG, WMA with bitrate and duration
- **Documents**: PDF, DOC, DOCX, TXT, RTF, ODT with page count
- **Presentations**: PPT, PPTX with slide count
- **Spreadsheets**: XLS, XLSX, CSV with data validation
- **Archives**: ZIP, RAR, 7Z with compression info
- **Software**: EXE, MSI, DMG, PKG, DEB, RPM
- **Datasets**: CSV, JSON, XML, SQL with data structure info

### 🔍 Advanced Search & Filtering
- Full-text search across file names, descriptions, and tags
- Category-based filtering
- Department and level filtering
- File type filtering
- Advanced sorting options
- Search history tracking

### 📊 File Management
- Drag-and-drop file upload
- File validation and type checking
- Progress tracking
- Metadata extraction
- File integrity verification (SHA256 checksums)
- Access control and permissions

### 🎨 User Interface
- Modern, responsive design
- Multimedia file preview
- File type icons and categorization
- Progress indicators
- Error handling and user feedback

## Architecture

### Server-Side (Node.js/Express)

#### File Model (`server/src/models/file.js`)
```javascript
// Comprehensive file schema with multimedia support
const fileSchema = new mongoose.Schema({
  // Basic file info
  fileName: String,
  storedName: String,
  fileType: String,
  mimeType: String,
  fileSize: Number,
  
  // Repository categorization
  category: String,
  department: String,
  level: String,
  semester: String,
  courseCode: String,
  courseTitle: String,
  
  // Multimedia metadata
  duration: Number,
  dimensions: { width: Number, height: Number },
  bitrate: Number,
  resolution: String,
  frameRate: Number,
  
  // Document metadata
  pageCount: Number,
  language: String,
  version: String,
  
  // Access control
  isPublic: Boolean,
  requiresAuth: Boolean,
  allowedRoles: [String],
  
  // Engagement metrics
  downloadCount: Number,
  viewCount: Number,
  likeCount: Number,
  
  // File integrity
  checksum: String,
  status: String
});
```

#### File Controller (`server/src/controllers/fileController.js`)
- `uploadRepositoryFile()` - Handle file uploads with metadata extraction
- `getRepositoryFiles()` - Retrieve files with filtering and pagination
- `getRepositoryFileById()` - Get single file with access control
- `downloadRepositoryFile()` - Secure file download with tracking
- `updateRepositoryFile()` - Update file metadata
- `deleteRepositoryFile()` - Delete files with cleanup
- `getRepositoryStats()` - Analytics and statistics

#### File Routes (`server/src/routes/fileRoutes.js`)
```javascript
// Repository-specific routes
repositoryRouter.post("/upload", requireSignIn, upload.single("file"), uploadRepositoryFile);
repositoryRouter.get("/files", getRepositoryFiles);
repositoryRouter.get("/files/:fileId", getRepositoryFileById);
repositoryRouter.get("/download/:fileId", requireSignIn, downloadRepositoryFile);
repositoryRouter.put("/files/:fileId", requireSignIn, updateRepositoryFile);
repositoryRouter.delete("/files/:fileId", requireSignIn, deleteRepositoryFile);
repositoryRouter.get("/stats", getRepositoryStats);
```

### Client-Side (React/TypeScript)

#### API Services (`client/src/services/api.ts`)
```typescript
export const repositoryApi = {
  getFiles: (filters: FileSearchFilters) => Promise<FileResponse>,
  getFileById: (fileId: string) => Promise<ApiResponse<RepositoryFile>>,
  uploadFile: (uploadData: FileUploadRequest) => Promise<FileUploadResponse>,
  downloadFile: (fileId: string) => Promise<Blob>,
  searchFiles: (query: string, filters: FileSearchFilters) => Promise<FileResponse>,
  getStats: () => Promise<ApiResponse<any>>
};
```

#### Data Service (`client/src/data/RepositoryFileData.ts`)
```typescript
export const repositoryDataService = {
  getFilesByCategory: (category: string, filters: any) => Promise<RepositoryFile[]>,
  getFilesByDepartment: (department: string, filters: any) => Promise<RepositoryFile[]>,
  uploadFile: (uploadData: any) => Promise<RepositoryFile>,
  downloadFile: (fileId: string) => Promise<Blob>,
  getStats: () => Promise<any>
};
```

## File Categories

### 1. Past Questions
- **Description**: Previous examination questions and solutions
- **Allowed Types**: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG
- **Max Size**: 50MB
- **Icon**: 📝

### 2. Textbooks
- **Description**: Course textbooks and reference materials
- **Allowed Types**: PDF, EPUB, MOBI, DOC, DOCX
- **Max Size**: 100MB
- **Icon**: 📚

### 3. Slides
- **Description**: Lecture slides and presentations
- **Allowed Types**: PPT, PPTX, PDF, KEY
- **Max Size**: 50MB
- **Icon**: 📊

### 4. Tutorials
- **Description**: Tutorial materials and guides
- **Allowed Types**: PDF, DOC, DOCX, TXT, MP4, AVI, MOV
- **Max Size**: 200MB
- **Icon**: 🎓

### 5. Research
- **Description**: Research papers and publications
- **Allowed Types**: PDF, DOC, DOCX, TXT, BIB
- **Max Size**: 50MB
- **Icon**: 🔬

### 6. Articles
- **Description**: Academic articles and journals
- **Allowed Types**: PDF, DOC, DOCX, TXT, HTML
- **Max Size**: 30MB
- **Icon**: 📄

### 7. Presentations
- **Description**: Student and faculty presentations
- **Allowed Types**: PPT, PPTX, PDF, KEY, MP4
- **Max Size**: 100MB
- **Icon**: 🎤

### 8. Journals
- **Description**: Academic journals and publications
- **Allowed Types**: PDF, DOC, DOCX, TXT
- **Max Size**: 50MB
- **Icon**: 📖

### 9. Videos
- **Description**: Educational videos and lectures
- **Allowed Types**: MP4, AVI, MOV, WMV, FLV, WEBM, MKV
- **Max Size**: 500MB
- **Icon**: 🎥

### 10. Audio
- **Description**: Audio lectures and podcasts
- **Allowed Types**: MP3, WAV, FLAC, AAC, OGG, WMA
- **Max Size**: 100MB
- **Icon**: 🎧

### 11. Images
- **Description**: Educational images and diagrams
- **Allowed Types**: JPG, JPEG, PNG, GIF, BMP, SVG, WEBP
- **Max Size**: 20MB
- **Icon**: 🖼️

### 12. Documents
- **Description**: General documents and files
- **Allowed Types**: PDF, DOC, DOCX, TXT, RTF, ODT
- **Max Size**: 50MB
- **Icon**: 📋

### 13. Software
- **Description**: Software tools and applications
- **Allowed Types**: EXE, MSI, DMG, PKG, DEB, RPM, ZIP, RAR
- **Max Size**: 500MB
- **Icon**: 💻

### 14. Datasets
- **Description**: Data files and datasets
- **Allowed Types**: CSV, XLS, XLSX, JSON, XML, SQL, ZIP, RAR
- **Max Size**: 200MB
- **Icon**: 📊

### 15. Templates
- **Description**: Document and project templates
- **Allowed Types**: DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR
- **Max Size**: 50MB
- **Icon**: 📋

## Departments

- **CS**: Computer Science
- **SE**: Software Engineering
- **IT**: Information Technology
- **CE**: Computer Engineering
- **General**: General academic materials

## Levels

- **100**: First Year
- **200**: Second Year
- **300**: Third Year
- **400**: Fourth Year
- **500**: Fifth Year
- **600**: Sixth Year
- **General**: General materials

## Semesters

- **First**: First Semester
- **Second**: Second Semester
- **Summer**: Summer Semester
- **General**: General materials

## API Endpoints

### File Management
- `POST /api/repository/upload` - Upload new file
- `GET /api/repository/files` - Get files with filtering
- `GET /api/repository/files/:fileId` - Get single file
- `GET /api/repository/download/:fileId` - Download file
- `PUT /api/repository/files/:fileId` - Update file
- `DELETE /api/repository/files/:fileId` - Delete file

### Search & Filtering
- `GET /api/repository/search` - Search files
- `GET /api/repository/category/:category` - Get files by category
- `GET /api/repository/department/:department` - Get files by department
- `GET /api/repository/multimedia` - Get multimedia files

### Analytics
- `GET /api/repository/stats` - Get repository statistics

## Components

### FileUpload
- Drag-and-drop interface
- File validation
- Progress tracking
- Metadata input forms

### RepositoryFileList
- File display with filtering
- Search capabilities
- Pagination
- File actions (view, download, delete)

### MultimediaViewer
- Image viewer
- Video player with controls
- Audio player
- Document preview
- File metadata display

### RepositorySearch
- Advanced search interface
- Filter options
- Search history
- Results display

## Security Features

- **File Integrity**: SHA256 checksums for file verification
- **Access Control**: Role-based permissions
- **File Validation**: Type and size validation
- **Rate Limiting**: Upload and download rate limits
- **Input Sanitization**: XSS protection
- **CORS Configuration**: Secure cross-origin requests

## Performance Features

- **File Compression**: Automatic compression for large files
- **Caching**: Response caching for static files
- **Pagination**: Efficient data loading
- **Lazy Loading**: On-demand file loading
- **Progress Tracking**: Real-time upload/download progress

## Usage Examples

### Upload a File
```typescript
const uploadData = {
  file: selectedFile,
  category: 'videos',
  department: 'cs',
  level: '200',
  semester: 'first',
  courseCode: 'CSC201',
  courseTitle: 'Data Structures',
  description: 'Introduction to data structures',
  tags: ['programming', 'algorithms'],
  isPublic: true
};

const result = await repositoryDataService.uploadFile(uploadData);
```

### Search Files
```typescript
const files = await repositoryDataService.getAllFiles({
  search: 'data structures',
  category: 'videos',
  department: 'cs',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### Download File
```typescript
const blob = await repositoryDataService.downloadFile(fileId);
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = fileName;
a.click();
```

## Environment Variables

### Server (.env)
```env
MONGODB_URI=mongodb://localhost:27017/runacoss
JWT_SECRET=your-jwt-secret
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=500000000
```

### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd client
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/env.example server/.env
   cp client/env.example client/.env
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB
   mongod

   # Initialize database
   npm run init-db
   ```

4. **Start Application**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 