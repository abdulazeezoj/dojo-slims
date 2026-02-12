# Export Cleanup with BullMQ

The export cleanup system has been integrated with the BullMQ worker to run as a scheduled background job.

## How It Works

### Automatic Scheduled Cleanup

When the BullMQ worker starts (`npm run worker` or `npm run worker:dev`), it automatically registers scheduled jobs defined in `src/schedules/index.ts`. The export cleanup job runs every hour at minute 0.

**Cron Pattern**: `0 * * * *` (every hour at minute 0)

### Architecture

```
┌─────────────────┐
│   Worker Start  │
└────────┬────────┘
         │
         ├─ Load task handlers (src/tasks/)
         │
         ├─ Load scheduled jobs (src/schedules/)
         │
         ├─ Register scheduled jobs with BullMQ
         │
         └─ Begin processing jobs from queue
                    │
                    ├─ Regular jobs (one-time)
                    │
                    └─ Scheduled jobs (recurring)
                              │
                              └─ exports.cleanup (hourly)
```

### File Structure

```
web/src/
├── tasks/                              # Task handlers
│   ├── cleanup-exports.ts              # Export cleanup task handler
│   ├── health.ts                       # Health check task handler
│   └── index.ts                        # Task registry
│
├── schedules/                          # Scheduled jobs config
│   └── index.ts                        # Job schedules (cron patterns)
│
├── lib/
│   ├── jobs/
│   │   └── cleanup-exports.ts          # Core cleanup logic
│   ├── export-service.ts               # Export file management
│   └── queue.ts                        # BullMQ queue setup
│
└── worker.ts                           # BullMQ worker process
```

## Usage

### Running the Worker

The worker must be running for scheduled jobs to execute:

```bash
# Development (auto-restarts on changes)
npm run worker:dev

# Production
npm run worker
```

### Manual Cleanup

You can still manually trigger cleanup without the worker:

```bash
npm run cleanup:exports
```

This is useful for:
- One-time cleanup operations
- Testing cleanup logic
- Fallback if worker is not running

## Adding New Scheduled Jobs

1. **Create task handler** in `src/tasks/`:

```typescript
// src/tasks/my-task.ts
export async function myTask(data: MyTaskData): Promise<MyTaskResult> {
  // Task logic here
  return result;
}
```

2. **Register task** in `src/tasks/index.ts`:

```typescript
import { myTask } from "./my-task";

export const taskHandlers = {
  // ... existing handlers
  "my.task": myTask,
};
```

3. **Add schedule** in `src/schedules/index.ts`:

```typescript
export const scheduledJobs = [
  // ... existing schedules
  {
    name: "my-task-daily",
    taskName: "my.task",
    repeat: {
      pattern: "0 2 * * *", // Daily at 2 AM
    },
    data: {}, // Optional task data
  },
];
```

4. **Restart worker** to activate the new schedule.

## Cron Pattern Examples

| Pattern       | Description                  |
|---------------|------------------------------|
| `* * * * *`   | Every minute                 |
| `0 * * * *`   | Every hour at minute 0       |
| `0 2 * * *`   | Daily at 2:00 AM             |
| `0 */4 * * *` | Every 4 hours                |
| `0 0 * * 0`   | Weekly on Sunday at midnight |
| `0 0 1 * *`   | Monthly on the 1st at midnight |

See [crontab.guru](https://crontab.guru/) for more patterns.

## Monitoring

### Logs

The worker logs all scheduled job activities:

```
[worker] Worker started and ready to process jobs from queue: dojo-slims
[worker] Initializing scheduled jobs...
[worker] Scheduled job registered: cleanup-exports-hourly (0 * * * *)
[worker] Processing job cleanup-exports-hourly of type exports.cleanup
[cleanup] [exports] Starting expired exports cleanup...
[cleanup] [exports] Deleted 3 expired export files
```

### BullMQ Dashboard

You can monitor jobs using Redis or a BullMQ dashboard:

- Job status (completed, failed, delayed)
- Retry attempts
- Job data and results
- Execution time

## Configuration

Configure worker behavior in `.env`:

```env
# Worker Configuration
WORKER_DEFAULT_QUEUE=dojo-slims
WORKER_REDIS_URL=redis://localhost:6379
WORKER_CONCURRENCY=5
WORKER_LIMITER_MAX=10
WORKER_LIMITER_DURATION=1000

# Export System
EXPORT_TOKEN_SECRET=your-secret-here
EXPORT_DEFAULT_EXPIRY_MINUTES=15
EXPORT_MAX_FILE_AGE_HOURS=24
```

## Production Deployment

### Using systemd

Create a service file for the worker:

```ini
[Unit]
Description=BullMQ Worker
After=network.target redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/app/web
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run worker
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable bullmq-worker
sudo systemctl start bullmq-worker
```

### Using Docker

Add to `docker-compose.yml`:

```yaml
services:
  worker:
    build: .
    command: npm run worker
    environment:
      - NODE_ENV=production
      - WORKER_REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped
```

### Using PM2

```bash
pm2 start npm --name "worker" -- run worker
pm2 save
```

## Troubleshooting

### Jobs Not Running

1. **Check worker is running**: `ps aux | grep worker`
2. **Check Redis connection**: Verify `WORKER_REDIS_URL` in `.env`
3. **Check logs**: Look for registration messages on startup

### Jobs Failing

1. **Check job logs**: Worker logs contain detailed error information
2. **Check Redis**: Ensure Redis has sufficient memory
3. **Verify configuration**: Ensure all required environment variables are set

### Duplicate Jobs

BullMQ uses `jobId` to prevent duplicates. Each scheduled job uses a unique `jobId` based on its `name` field in `schedules/index.ts`.

## Benefits Over Standalone Cron

1. **Centralized logging**: All job execution logged through worker
2. **Retry mechanism**: Automatic retries on failure
3. **Job persistence**: Jobs survive app restarts
4. **Monitoring**: Track job history and performance
5. **Scalability**: Distribute jobs across multiple workers
6. **No cron required**: Works on any platform (Windows, Docker, etc.)

## Migration Notes

The old standalone script approach (`npm run cleanup:exports`) still works for backward compatibility and manual execution. However, when the worker is running, scheduled cleanup happens automatically through BullMQ.
