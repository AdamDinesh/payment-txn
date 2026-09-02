const { z } = require('zod');
const webhookSchema = z.object({
    transactionId: z.string().uuid(),
    providerRef: z.string().min(1).max(150),
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED']),
    timestamp: z.string().datetime()
}).strict();
module.exports = webhookSchema;