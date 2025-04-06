Projects API:
    GET /api/v1/projects: Lists projects for the authenticated user.
    GET /api/v1/projects/[projectId]: Gets details for a specific project owned by the user.
Sessions API:
    POST /api/v1/sessions: Creates a new session (including starting a basic Docker container).
    GET /api/v1/sessions/[sessionId]: Gets details for a specific session, checks container status, and verifies ownership.
    DELETE /api/v1/sessions/[sessionId]: Stops and removes the associated Docker container and deletes the session record.
    GET /api/v1/sessions/[sessionId]/logs: Retrieves logs from the associated Docker container.


Sessions API:
    POST Create a Session (app/api/v1/sessions/route.ts)
    GET Session (app/api/v1/sessions/[sessionId]/route.ts)
    GET Session Logs (app/api/v1/sessions/[sessionId]/logs/route.ts)
    (Implicit) DELETE Session (app/api/v1/sessions/[sessionId]/route.ts - Implemented the DELETE method, which aligns with terminating a session).
Projects API:
    GET List projects (app/api/v1/projects/route.ts)
    GET Project (app/api/v1/projects/[projectId]/route.ts)
