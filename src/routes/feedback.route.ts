import { Hono } from 'hono';
import { some, every } from 'hono/combine';
import { authorizedRoles, isAuthenticated } from '../middlewares/authorization';
import { myTickets, openTicket, sendTicket, ticketList } from '../controllers/feedback.controller';
import { validationMiddleware } from '../middlewares/validation';
import { paginationSchema, ticketListSchema } from '../schemas';

const feedbackRouter = new Hono();

feedbackRouter.get('/my-tickets', some(every(isAuthenticated, validationMiddleware('query', paginationSchema))), myTickets);

feedbackRouter.post('/', some(every(isAuthenticated)), sendTicket);

feedbackRouter.get('/', some(every(isAuthenticated, authorizedRoles('admin', 'support_agent'), 
    validationMiddleware('query', ticketListSchema))), ticketList
);

feedbackRouter.get('/:ticketId', some(every(isAuthenticated, authorizedRoles('admin', 'support_agent'))), openTicket);

export default feedbackRouter;