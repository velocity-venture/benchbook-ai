/**
 * BenchBook AI - Health Check Endpoint
 * 
 * Simple health check for API Gateway monitoring.
 */

export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "healthy",
      service: "benchbook-ai",
      timestamp: new Date().toISOString(),
      version: process.env.PROMPT_VERSION || "v1",
    }),
  };
};
