import { Hono } from 'hono'
import { handle, LambdaContext, LambdaEvent } from 'hono/aws-lambda'

type Bindings = {
    event: LambdaEvent
    lambdaContext: LambdaContext
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/aws-lambda-info/', (c) => {
    return c.json({
        isBase64Encoded: c.env.event.isBase64Encoded,
        awsRequestId: c.env.lambdaContext.awsRequestId,
    })
})

app.get('/', (c) => c.text('Hello Hono!'))

export const handler = handle(app)