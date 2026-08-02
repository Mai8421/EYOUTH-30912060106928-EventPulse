/**
 * @openapi
 * /health:
 *   get: {summary: Health check, responses: {'200': {description: Server and database state}}}
 * /api/auth/register:
 *   post: {summary: Register attendee, requestBody: {required: true, content: {application/json: {schema: {type: object, required: [name,email,password], properties: {name: {type: string}, email: {type: string}, password: {type: string}}}}}}, responses: {'201': {description: Registered}, '422': {description: Invalid input}}}
 * /api/auth/login:
 *   post: {summary: Login, responses: {'200': {description: JWT returned}, '401': {description: Invalid credentials}}}
 * /api/events:
 *   get:
 *     summary: List and filter events
 *     parameters: [{in: query, name: category, schema: {type: string}}, {in: query, name: city, schema: {type: string}}, {in: query, name: startDate, schema: {type: string}}, {in: query, name: endDate, schema: {type: string}}, {in: query, name: page, schema: {type: integer}}, {in: query, name: limit, schema: {type: integer}}, {in: query, name: sort, schema: {type: string}}, {in: query, name: search, schema: {type: string}}]
 *     responses: {'200': {description: Paginated events}}
 *   post: {summary: Create event (admin), security: [{bearerAuth: []}], requestBody: {required: true, content: {application/json: {schema: {$ref: '#/components/schemas/Event'}}}}, responses: {'201': {description: Created}, '403': {description: Forbidden}}}
 * /api/events/{id}:
 *   get: {summary: Show event, parameters: [{in: path, name: id, required: true, schema: {type: string}}], responses: {'200': {description: Event}, '404': {description: Not found}}}
 *   patch: {summary: Update event (admin), security: [{bearerAuth: []}], parameters: [{in: path, name: id, required: true, schema: {type: string}}], responses: {'200': {description: Updated}}}
 *   delete: {summary: Delete event (admin), security: [{bearerAuth: []}], parameters: [{in: path, name: id, required: true, schema: {type: string}}], responses: {'204': {description: Deleted}}}
 * /api/registrations/events/{eventId}:
 *   post: {summary: Register for event, security: [{bearerAuth: []}], parameters: [{in: path, name: eventId, required: true, schema: {type: string}}], responses: {'201': {description: Registered}, '409': {description: Full or duplicate}}}
 * /api/registrations:
 *   get: {summary: My registrations, security: [{bearerAuth: []}], responses: {'200': {description: Registrations}}}
 * /api/registrations/{id}:
 *   delete: {summary: Cancel own registration, security: [{bearerAuth: []}], parameters: [{in: path, name: id, required: true, schema: {type: string}}], responses: {'204': {description: Cancelled}}}
 * /api/events/{eventId}/messages:
 *   get: {summary: Announcement history, parameters: [{in: path, name: eventId, required: true, schema: {type: string}}], responses: {'200': {description: Messages}}}
 *   post: {summary: Broadcast announcement (admin), security: [{bearerAuth: []}], parameters: [{in: path, name: eventId, required: true, schema: {type: string}}], responses: {'201': {description: Sent and stored}}}
 */
