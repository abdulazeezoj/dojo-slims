# Export Directory

**Purpose**: This directory stores temporarily generated export files (PDFs, bulk exports) with automatic expiry and cleanup.

## Recommended Implementation

When fully implemented, this directory would use **signed URL authentication** with JWT tokens, providing:
- ✅ User authentication and authorization
- ✅ Time-based expiry (default: 15 minutes)
- ✅ Download count limiting
- ✅ Audit trail in database
- ✅ Automatic cleanup of expired files

## Directory Structure

```
export/
├── {uuid}.pdf          # Generated PDFs with UUID filenames
├── {uuid}.zip          # Bulk exports
├── .gitkeep
├── README.md
└── EXPORT_SECURITY_GUIDE.md  # Detailed implementation guide
```

## File Access

When implemented, files would be accessed via authenticated API endpoint:

```
GET /api/export/{fileId}?token={jwt_token}
```

The JWT token would contain:
- File ID
- User ID
- Expiration timestamp
- Cryptographic signature

## Automatic Cleanup

When implemented, expired files would be automatically deleted by a scheduled job that runs hourly:
- Checks database for expired `ExportedFile` records
- Deletes physical files from disk
- Removes database records

## Implementation

See `EXPORT_SECURITY_GUIDE.md` for complete implementation details including:
- Database schema
- Export service code
- API routes
- Cleanup jobs
- Configuration

## Git

Only the following files are intended to be tracked in Git:
- `.gitkeep` (preserves directory in git)
- `README.md` (this file)
- `EXPORT_SECURITY_GUIDE.md` (implementation guide)

To avoid accidentally committing generated export files, ensure your Git configuration (for example, `web/.gitignore`) ignores `export/*` while explicitly allowing the files listed above.

Generated export files are never committed to version control.

## Development Notes

**DO NOT** serve this directory directly via nginx, bun serve, or any static file server without proper authentication. Always use the API endpoint which validates JWT tokens and checks permissions.

See `EXPORT_SECURITY_GUIDE.md` for complete setup instructions including cleanup job configuration.

