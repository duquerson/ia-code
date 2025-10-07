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

app.get('/api/test/:id', ({ params, set }) => {
    const foundItem = test.find(item => item.id === params.id);
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
    const data = test.filter(item => item.id !== params.id);
    set.status = 204;
    console.log({ message: 'Item deleted successfully' });
    console.log(data);

}, {
    params: t.Object({
        id: t.Number()
    })
})

app.listen(PORT, ({ hostname, port }: server) => console.log(`Server running at http://${hostname}:${port}`))




