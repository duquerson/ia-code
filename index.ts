import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { PORT } from './config.js';
const app = new Elysia({ adapter: node() });

app.get('/', () => 'Hello World!')

app.listen(PORT, ({ hostname, port }: { hostname: string, port: number }) => console.log(`Server running at http://${hostname}:${port}`))



