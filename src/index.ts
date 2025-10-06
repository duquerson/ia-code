import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { PORT } from '../config.js';
import type { server } from './types/index.js';
import { test } from './mock/index.js';
const app = new Elysia({ adapter: node() });

app.get('/', () => test)

app.listen(PORT, ({ hostname, port }: server) => console.log(`Server running at http://${hostname}:${port}`))



