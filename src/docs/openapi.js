/**
 * @openapi
 * /:
 *   get:
 *     summary: API overview
 *     responses: {'200': {description: API links and version}}
 * /health:
 *   get:
 *     summary: Health check
 *     responses: {'200': {description: Server and database state}}
 * /api/auth/register:
 *   post:
 *     summary: Register an attendee
 *     requestBody: {required: true, content: {application/json: {schema: {$ref: '#/components/schemas/RegisterInput'}}}}
 *     responses: {'201': {description: User and JWT}, '409': {description: Duplicate email}, '422': {description: Structured validation errors}}
 * /api/auth/login:
 *   post:
 *     summary: Log in
 *     requestBody: {required: true, content: {application/json: {schema: {$ref: '#/components/schemas/LoginInput'}}}}
 *     responses: {'200': {description: User and JWT}, '401': {description: Invalid credentials}, '422': {description: Invalid input}}
 * /api/auth/me:
 *   get:
 *     summary: Current authenticated user
 *     security: [{bearerAuth: []}]
 *     responses: {'200': {description: Current user}, '401': {description: Missing, invalid or expired token}}
 * /api/events:
 *   get:
 *     summary: List, filter, search, sort and paginate events
 *     parameters:
 *       - {in: query, name: category, schema: {type: string}, description: Category ObjectId}
 *       - {in: query, name: city, schema: {type: string}}
 *       - {in: query, name: startDate, schema: {type: string, format: date-time}}
 *       - {in: query, name: endDate, schema: {type: string, format: date-time}}
 *       - {in: query, name: search, schema: {type: string}, description: Searches name and description}
 *       - {in: query, name: sort, schema: {type: string, enum: [date, -date, popular]}}
 *       - {in: query, name: page, schema: {type: integer, minimum: 1}}
 *       - {in: query, name: limit, schema: {type: integer, minimum: 1, maximum: 100}}
 *     responses: {'200': {description: Event list and pagination metadata}}
 *   post:
 *     summary: Create an event (admin only)
 *     security: [{bearerAuth: []}]
 *     requestBody: {required: true, content: {application/json: {schema: {$ref: '#/components/schemas/EventInput'}}}}
 *     responses: {'201': {description: Created event with populated category}, '401': {description: Unauthenticated}, '403': {description: Forbidden}, '422': {description: Invalid fields}}
 * /api/events/{id}:
 *   parameters: [{in: path, name: id, required: true, schema: {type: string}}]
 *   get:
 *     summary: Show an event
 *     responses: {'200': {description: Event with populated category}, '404': {description: Event not found}, '422': {description: Invalid ObjectId}}
 *   patch:
 *     summary: Partially update an event (admin only)
 *     security: [{bearerAuth: []}]
 *     requestBody: {required: true, content: {application/json: {schema: {$ref: '#/components/schemas/EventInput'}}}}
 *     responses: {'200': {description: Updated event}, '401': {description: Unauthenticated}, '403': {description: Forbidden}, '404': {description: Event not found}, '422': {description: Invalid fields}}
 *   delete:
 *     summary: Delete an event (admin only)
 *     security: [{bearerAuth: []}]
 *     responses: {'204': {description: Deleted}, '401': {description: Unauthenticated}, '403': {description: Forbidden}, '404': {description: Event not found}, '422': {description: Invalid ObjectId}}
 * /api/registrations:
 *   get:
 *     summary: List the current user's registrations
 *     security: [{bearerAuth: []}]
 *     responses: {'200': {description: Registrations with event and category}, '401': {description: Unauthenticated}}
 * /api/registrations/events/{eventId}:
 *   post:
 *     summary: Register the current attendee for an event
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: eventId, required: true, schema: {type: string}}]
 *     responses: {'201': {description: Registration created}, '401': {description: Unauthenticated}, '404': {description: Event not found}, '409': {description: Event full or duplicate registration}, '422': {description: Invalid ObjectId}}
 * /api/registrations/{id}:
 *   delete:
 *     summary: Cancel an owned registration and free capacity
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: id, required: true, schema: {type: string}}]
 *     responses: {'204': {description: Cancelled}, '401': {description: Unauthenticated}, '404': {description: Not found or not owned}, '422': {description: Invalid ObjectId}}
 * /api/events/{eventId}/messages:
 *   get:
 *     summary: List announcement history in chronological order
 *     parameters: [{in: path, name: eventId, required: true, schema: {type: string}}]
 *     responses: {'200': {description: Stored announcements}, '422': {description: Invalid ObjectId}}
 *   post:
 *     summary: Save and broadcast an announcement (admin only)
 *     security: [{bearerAuth: []}]
 *     parameters: [{in: path, name: eventId, required: true, schema: {type: string}}]
 *     requestBody: {required: true, content: {application/json: {schema: {$ref: '#/components/schemas/MessageInput'}}}}
 *     responses: {'201': {description: Announcement saved and emitted}, '401': {description: Unauthenticated}, '403': {description: Forbidden}, '404': {description: Event not found}, '422': {description: Invalid input}}
 */
