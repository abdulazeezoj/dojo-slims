# Upload Directory

**⚠️ SECURITY NOTICE**: This directory stores user-uploaded files and **MUST NOT** be publicly accessible.

## Structure

Files are organized by user and context:

```
upload/
├── {studentId}/
│   ├── {weekId}/
│   │   ├── {uuid}.jpg
│   │   ├── {uuid}.png
│   │   └── ...
│   └── ...
└── .gitkeep
```

## Security

- ✅ Files are **NOT** in `public/` directory
- ✅ Served only through authenticated `/api/files/` endpoint
- ✅ Ownership verified before access
- ✅ All uploads are sanitized and validated

## Access

Files can only be accessed via:

```
GET /api/files/{studentId}/{weekId}/{filename}
```

With proper authentication and ownership verification.

## Git

This directory is gitignored except for `.gitkeep`. User uploads are never committed to version control.

## Maintenance

For production:

- Set up automated backups
- Implement cleanup for orphaned files
- Monitor disk usage
- Consider migrating to cloud storage (S3/R2) for scalability
