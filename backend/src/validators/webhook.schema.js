const { z } = require('zod');
const webhookSchema = z.object({
    transactionId: z.string().uuid(),
    providerReference: z.string().min(1).max(150),
    status: z.enum(['SUCCESS', 'FAILED']),
    timestamp: z.string().datetime()
});
module.exports = webhookSchema;