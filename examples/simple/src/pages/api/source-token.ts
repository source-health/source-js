import { TokenGenerator } from '@source-health/source-js/server'
import type { NextApiRequest, NextApiResponse } from 'next'

const generator = new TokenGenerator(
  process.env.SOURCE_KEY_ID || 'key_YYc96gyopG0klWfUOhQU',
  process.env.SOURCE_KEY_SECRET ||
    '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',
)

export default function (_req: NextApiRequest, res: NextApiResponse) {
  res.json({
    token: generator.generate({
      member: process.env.SOURCE_MEMBER_ID || 'mem_519zW7gVTy19LS9uDQAe',
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
      scopes: [],
    }),
  })
}
