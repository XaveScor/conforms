/* @flow */

import type {PageType} from './pageTypes'
import type {SinglePhrase, TriplePhrase} from './createPhrase';
import * as React from 'react';
import type {EventType} from './event';
import type {ViewData} from './historyBlock';
import type {Input} from './createInput'

type TotalPage = Page | PageType

export type StepResult = {
    id: any,
    value: any,
}

export type PrevousPageResult = {
    prevousPage: TotalPage,
    steps: $ReadOnlyArray<StepResult>,
};

export type SingleStep<T> = {|
    ...$Exact<SinglePhrase<T>>,
    question: T,
    id: any,
    input: Input,
|};

export type TripleStep<Tq, Ta, Te> = {|
    ...$Exact<TriplePhrase<Tq, Ta, Te>>,
    question: Tq,
    error: Te,
    id: any,
    input: Input,
|};

export type Step =
    | SingleStep<*>
    | TripleStep<*, *, *>

export type TimeoutConfig = {|
    duration: number,
    page: TotalPage,
|}

type Config = {|
    nextPage: TotalPage,
    steps: $ReadOnlyArray<Step>,
    timeout?: TimeoutConfig,
|};

export type SchemeF = 
    | ((PrevousPageResult) => Promise<Config>)
    | ((PrevousPageResult) => Config)
    | Config

export class Page {
    name: ?string
    schemeF: ?SchemeF
    constructor(name?: string) {
        this.name = name
    }

    use(schemeF: SchemeF) {
        this.schemeF = schemeF
    }
}

export function createPage(name?: string) {
    return new Page(name)
}
