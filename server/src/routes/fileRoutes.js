const express = require('express');
const upload = require("../middleware/fileUploads");
const requireUserSignIn = require("../middleware/requireUserSignIn");
const requireAdminSignIn = require("../middleware/requireAdminSignIn");
const checkAdminPermission = require("../middleware/checkAdminPermission");
const requireRepositoryAccess = require("../middleware/requireRepositoryAccess");
const {
  uploadFile, 
  downloadFile, 
  deleteFile, 
  getAllFiles, 
  getSingleFile, 
  replaceFile,
  uploadRepositoryFile,
  getRepositoryFiles,
  getRepositoryFileById,
  downloadRepositoryFile,
  updateRepositoryFile,
  deleteRepositoryFile,
  getRepositoryStats
} = require("../controllers/fileController");

const fileRouter = express.Router();

// Legacy file routes (keeping for backward compatibility)
fileRouter.post("/upload", requireUserSignIn, upload.single("file"), uploadFile);
fileRouter.get("/download/:fileId", requireUserSignIn, downloadFile);
fileRouter.delete("/delete/:fileId", requireUserSignIn, deleteFile);
fileRouter.get("/user/:userId/:fileId", requireUserSignIn, getSingleFile);
fileRouter.get("/user/:userId", requireUserSignIn, getAllFiles);
fileRouter.put("/replace/:fileId", requireUserSignIn, upload.single("file"), replaceFile);
fileRouter.get("/:fileId", requireUserSignIn, getSingleFile);
fileRouter.get("/", requireUserSignIn, getAllFiles);

// Repository routes with user restrictions
const repositoryRouter = express.Router();

// User-accessible repository routes (view, upload, download, delete own files)
repositoryRouter.post("/upload", requireUserSignIn, requireRepositoryAccess, upload.single("file"), uploadRepositoryFile);
repositoryRouter.get("/files", requireUserSignIn, requireRepositoryAccess, getRepositoryFiles); // Public access for browsing
repositoryRouter.get("/files/:fileId", getRepositoryFileById);
repositoryRouter.get("/download/:fileId", requireUserSignIn, requireRepositoryAccess, downloadRepositoryFile);

// User can only update/delete their own files
repositoryRouter.put("/files/:fileId", requireUserSignIn, updateRepositoryFile);
repositoryRouter.delete("/files/:fileId", requireUserSignIn, deleteRepositoryFile);

// Repository stats - accessible to approved users
repositoryRouter.get("/stats", requireUserSignIn, requireRepositoryAccess, getRepositoryStats);

// Search and filter endpoints (public access)
repositoryRouter.get("/search", getRepositoryFiles);
repositoryRouter.get("/category/:category", getRepositoryFiles);
repositoryRouter.get("/department/:department", getRepositoryFiles);
repositoryRouter.get("/multimedia", getRepositoryFiles);

// Repository file endpoints (legacy - keeping for backward compatibility)
fileRouter.post("/repository/upload", requireUserSignIn, requireRepositoryAccess, upload.single("file"), uploadRepositoryFile);
fileRouter.get("/repository/files", requireUserSignIn, requireRepositoryAccess, getRepositoryFiles);
fileRouter.get("/repository/files/:id", requireUserSignIn, requireRepositoryAccess, getRepositoryFileById);
fileRouter.get("/repository/download/:id", requireUserSignIn, requireRepositoryAccess, downloadRepositoryFile);
fileRouter.delete("/repository/files/:id", requireUserSignIn, requireRepositoryAccess, deleteRepositoryFile);

module.exports = { fileRouter, repositoryRouter };
