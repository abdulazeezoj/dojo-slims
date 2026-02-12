# Export Directory

**Purpose**: This directory stores temporarily generated export files (PDFs, bulk exports) with automatic expiry and cleanup.

## Security Model

Files in this directory use **signed URL authentication** with JWT tokens, providing:
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

Files can ONLY be accessed via authenticated API endpoint:

```
GET /api/export/{fileId}?token={jwt_token}
```

The JWT token contains:
- File ID
- User ID
- Expiration timestamp
- Cryptographic signature

## Automatic Cleanup

Expired files are automatically deleted by a scheduled job that runs hourly:
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

This directory is gitignored except for:
- `.gitkeep` (preserves directory in git)
- `README.md` (this file)
- `EXPORT_SECURITY_GUIDE.md` (implementation guide)

Generated export files are never committed to version control.

## Development Notes

**DO NOT** serve this directory directly via nginx, bun serve, or any static file server without proper authentication. Always use the API endpoint which validates JWT tokens and checks permissions.

For development:
```bash
# Run cleanup manually
npm run cleanup:exports
```

For production:
```bash
# Set up cron job or use BullMQ scheduler
0 * * * * cd /path/to/app && NODE_ENV=production node lib/jobs/cleanup-exports.js
```

