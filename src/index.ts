import { Elysia, t } from 'elysia'
import { node } from '@elysiajs/node'
import { PORT } from '../config.js';
import type { server } from './types/index.js';
import { test } from './mock/index.js';
const app = new Elysia({ adapter: node() });

app.get('/', () => test)

app.get('/test', () => {
    return new Response('<h1>Test route</h1>', {
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    })
})

app.get('/api/test/:id', ({ params }) => {
    const foundItem = test.find(item => item.id === params.id);
    return foundItem ?? { error: 'Not found' };
}, {
    params: t.Object({
        id: t.Number()
    })
})




app.listen(PORT, ({ hostname, port }: server) => console.log(`Server running at http://${hostname}:${port}`))




