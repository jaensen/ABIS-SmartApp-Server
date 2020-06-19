export class Emitter<T> implements AsyncIterable<T>
{
    private _pullQueue:((arg:{value:T, done:boolean})=>void)[] = [];
    private _pushQueue:{value:T, done:boolean}[] = [];

    readonly name:string;

    constructor(name:string)
    {
        this.name = name;
    }

    [Symbol.asyncIterator](): AsyncIterator<T, any, undefined> {
        const self = this;
        return {
            next() {
                // See if there are already some values in the pushQueue
                const pushedEntry = self._pushQueue.shift();
                if (pushedEntry) {
                    return new Promise<IteratorResult<T>>(resolve => resolve({
                        value: pushedEntry.value,
                        done: pushedEntry.done
                    }));
                } else {
                    return new Promise<IteratorResult<T>>(((resolve, reject) =>
                    {
                        self._pullQueue.push((args) => {
                            resolve(args);
                        });

                        if (self._pullQueue.length > 1)
                        {
                            throw new Error("More than one subscriber.")
                        }
                    }));
                }
            }
        }
    }

    publish(event:T, stop:boolean =  false) {
        const pullEntry = this._pullQueue.shift();
        if (pullEntry)
        {
            pullEntry({
                value: event,
                done: stop
            });
            return;
        }
        this._pushQueue.push({
            value: event,
            done: stop
        });
    }

    stop() {
        this._pushQueue.push({
            value: <any>{},
            done: true
        });
    }
}