import {createPage, input, Stop, runChat} from '..'

it('createPage arg: function', done => {
    const startPage = createPage(() => {
        return {
            steps: [],
            nextPage: stopPage,
        }
    });
    const stopPage = createPage(() => {
        done()
        return {
            steps: [],
            nextPage: Stop,
        }
    });

    runChat(startPage, {})
});

it('createPage arg: async function', done => {
    const startPage = createPage(async () => {
        return {
            steps: [],
            nextPage: stopPage,
        }
    });
    const stopPage = createPage(async () => {
        done()
        return {
            steps: [],
            nextPage: Stop,
        }
    });

    runChat(startPage, {})
});