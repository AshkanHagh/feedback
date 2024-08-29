import { Hono } from 'hono';
import { some, every } from 'hono/combine';
import { authorizedRoles, isAuthenticated } from '../middlewares/authorization';
import { myTickets, openTicket, userSendComment, adminSendComment, sendTicket, ticketList, 
    myTicket, 
    closeTicket
} from '../controllers/feedback.controller';
import { validationMiddleware } from '../middlewares/validation';
import { paginationSchema, sendCommentSchema, ticketListSchema } from '../schemas';

const feedbackRouter = new Hono();

feedbackRouter.get('/tickets/mine', some(every(isAuthenticated, validationMiddleware('query', paginationSchema))), myTickets);

feedbackRouter.get('/ticket/:ticketId', isAuthenticated, myTicket);

feedbackRouter.post('/tickets/:ticketId/comment', some(every(isAuthenticated, authorizedRoles('admin', 'support_agent'), 
    validationMiddleware('json', sendCommentSchema))), adminSendComment
);

feedbackRouter.post('/tickets/:ticketId/comment/user', some(every(isAuthenticated, 
    validationMiddleware('json', sendCommentSchema))), userSendComment
);

feedbackRouter.post('/tickets', isAuthenticated, sendTicket);

feedbackRouter.get('/tickets', some(every(isAuthenticated, authorizedRoles('admin', 'support_agent'), 
    validationMiddleware('query', ticketListSchema))), ticketList
);

feedbackRouter.get('/tickets/:ticketId', some(every(isAuthenticated, authorizedRoles('admin', 'support_agent'))), openTicket);

feedbackRouter.get('/tickets/:ticketId/close', some(every(isAuthenticated, authorizedRoles('admin', 'support_agent'))), closeTicket);


export default feedbackRouter;