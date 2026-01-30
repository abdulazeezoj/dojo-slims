import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { defaultQueue } from "@/lib/queue";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskName, data } = body;

    if (!taskName) {
      return createErrorResponse("Task name is required", { status: 400 });
    }

    const job = await defaultQueue.add(taskName, data || {}, {
      removeOnComplete: {
        age: 60,
        count: 100,
      },
    });

    return createSuccessResponse({
      jobId: job.id,
      taskName,
      status: "queued",
      message: "Job added to queue successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to add job to queue",
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return createErrorResponse("Job ID is required", { status: 400 });
    }

    const job = await defaultQueue.getJob(jobId);

    if (!job) {
      return createErrorResponse("Job not found", { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress;
    const returnvalue = job.returnvalue;
    const failedReason = job.failedReason;

    return createSuccessResponse({
      jobId: job.id,
      taskName: job.name,
      state,
      progress,
      result: returnvalue,
      error: failedReason,
      attempts: job.attemptsMade,
      timestamp: job.timestamp,
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : "Failed to get job status",
      { status: 500 },
    );
  }
}
