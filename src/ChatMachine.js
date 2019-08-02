// @flow
import type {NotifyViewEvent, DialogElement, PendingConfig, State} from './types';
import type {Step, TimeoutConfig, NonAnswerableStep, AnswerableStep} from './createPage';
import type {EditEvent} from './runChat';
import type {Bubble, AnswerBubble} from './createBubble'
import {ValidationError} from './ValidationError'
import {voidF} from './common'

type Args = {|
    config: Step,
    idx: number,
    editEvent: EditEvent,
|}

const defaultTimeout = 500
export class ChatMachine {
    dialog: Array<DialogElement> = []
    notifyView: NotifyViewEvent
    pendingTimeout: ?TimeoutID = null
    pending: ?PendingConfig

    constructor(notifyView: NotifyViewEvent, pending?: PendingConfig) {
        this.notifyView = notifyView
        this.pending = pending
    }

    async notify(
        newDialogElement: DialogElement | null,
        input: $PropertyType<State, 'input'>
    ) {
        if (newDialogElement != null) {
            this.dialog = [
                ...this.dialog,
                newDialogElement
            ]
        }
        this.notifyView({
            dialog: this.dialog,
            input,
        })
    }

    async showPending() {
        const pending = this.pending
        if (this.pendingTimeout != null || pending == null) {
            return;
        }
        const {pendingTimeout} = pending
        const timeout = pendingTimeout || defaultTimeout

        this.pendingTimeout = setTimeout(() => {
            this.notify({
                component: pending.pending,
                props: pending.pendingProps,
            }, {
                component: pending.input,
                props: {
                    ...pending.inputProps,
                    isAnswerable: false,
                },
            })
        }, timeout)
    }

    async runAnswerableStep(config: AnswerableStep) {
        const inputProps = {
            ...config.inputProps,
            isAnswerable: true,
        }
        const validate = config.validate || (voidF: any => void)
        return new Promise(resolve => {
            const handleInputSubmit = (answer: any) => {
                const error = validate(answer)
                if (error instanceof ValidationError) {
                    return this.notify(null, {
                        component: config.input,
                        props: {
                            ...inputProps,
                            error: error.message,
                        }
                    })
                }

                this.notify({
                    component: config.answer,
                    props: {
                        ...config.answerProps,
                        answer,
                        handleEditAnswer: null,
                    },
                }, {
                    component: config.input,
                    props: inputProps,
                })
                resolve(answer)
            }
            this.notify({
                component: config.question,
                props: config.questionProps,
            }, {
                component: config.input,
                props: {
                    ...inputProps,
                    onSubmit: handleInputSubmit,
                },
            })
        })
    }

    async runNonAnswerableStep(config: NonAnswerableStep) {
        await this.notify({
            component: config.question,
            props: config.questionProps,
        }, {
            component: config.input,
            props: {
                ...config.inputProps,
                isAnswerable: false,
            },
        })
    }

    async runStep({
        config,
        idx,
        editEvent,
    }: Args) {
        const pending = this.pending
        if (this.pendingTimeout != null && pending != null) {
            clearTimeout(this.pendingTimeout)
            this.pendingTimeout = null
            // clear last `pending` element
            this.dialog = this.dialog.filter(el => el.component !== pending.pending)
        }

        return config.isAnswerable
            ? this.runAnswerableStep(config)
            : this.runNonAnswerableStep(config)
    }
}
