import { TokenGenerator } from '@source-health/source-js/server'
import type { NextApiRequest, NextApiResponse } from 'next'

const generator = new TokenGenerator(
  process.env.SOURCE_KEY_ID || '',
  process.env.SOURCE_KEY_SECRET || '',
)

export default function (_req: NextApiRequest, res: NextApiResponse) {
  res.json({
    token: generator.generate({
      member: process.env.SOURCE_MEMBER_ID || '',
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
      scopes: [],
    }),
  })
}
