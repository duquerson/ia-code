import { Elysia, t } from 'elysia'
import { node } from '@elysiajs/node'
import { PORT } from '../config.js';
import type { server } from './types/index.js';
import { data } from './mock/index.js';

const app = new Elysia({ adapter: node() });

app.get('/', () => data.test)

app.get('/test', () => {
    return new Response('<h1>Test route</h1>', {
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    })
})

app.get('/api/test/:id', ({ params, set }) => {
    const foundItem = data.test.find(item => item.id === params.id);
    if (!foundItem) {
        set.status = 404;
        return { error: 'Not found' };
    }
    return foundItem;
}, {
    params: t.Object({
        id: t.Number()
    })
})

app.delete('/api/test/:id', ({ params, set }) => {
    const itemIndex = data.test.findIndex(item => item.id === params.id);

    if (itemIndex === -1) {
        set.status = 404;
        return { error: 'Item not found' };
    }

    data.test = data.test.filter(item => item.id !== params.id);
    set.status = 204;
}, {
    params: t.Object({
        id: t.Number()
    })
})

app.post('/api/test', ({ body, set }) => {
    const newItem = {
        id: body.id,
        content: body.content,
        date: body.date ?? new Date().toISOString(),
        important: body.important ?? false
    };


    data.test = [...data.test, newItem];
    set.status = 201;
    return newItem;
}, {
    body: t.Object({
        id: t.Number(),
        content: t.String(),
        date: t.String(),
        important: t.Boolean()
    })
})

app.listen(PORT, ({ hostname, port }: server) => console.log(`Server running at http://${hostname}:${port}`))