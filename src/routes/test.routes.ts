import { Elysia, t } from 'elysia'
import { data } from '../mock/index.js';

export const testRoutes = new Elysia({ prefix: '/api/test' })
    .get('/', () => data.test)

    .get('/:id', ({ params, set }) => {
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

    .delete('/:id', ({ params, set }) => {
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

    .post('/', ({ body, set }) => {
        const newItem = {
            id: body.id,
            content: body.content,
            date: body.date,
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
    .all('*', ({ set, request }) => {
        set.status = 400;
        return {
            error: 'Bad Request',
            message: `Method ${request.method} not allowed or route not found`
        };
    });