import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import fastify from 'fastify'
import { createGoal } from '../features/create-goal'
import z from 'zod'
import { getWeekPendingGoals } from '../features/get-week-pending-goals'
import { createGoalCompletion } from '../features/create-goal-completion'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async req => {
    const { title, desiredWeeklyFrequency } = req.body

    await createGoal({
      title,
      desiredWeeklyFrequency,
    })
  }
)

//*OUTRA FORMA DE FAZER QUE NA MINHA OPNIÃO É MAIS CLEAN
/**
 * app.post('/goals', async req => {
  const creatGoalSchema = z.object({
    title: z.string(),
    desiredWeeklyFrequency: z.number().int().min(1).max(7),
  })

  const { title, desiredWeeklyFrequency } = creatGoalSchema.parse(req.body)

  await createGoal({
    title,
    desiredWeeklyFrequency,
  })
})
 */

app.get('/pending-goals', async req => {
  const { pendingGoals } = await getWeekPendingGoals()

  return { pendingGoals }
})

app.post(
  '/completions',
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    },
  },
  async req => {
    const { goalId } = req.body

    await createGoalCompletion({
      goalId,
    })
  }
)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running')
  })
