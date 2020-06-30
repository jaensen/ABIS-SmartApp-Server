import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {NewEntry_1_0_0} from "@abis/types/dist/schemas/abis/types/events/notifications/_generated/newEntry_1_0_0";
import {RuntimeDialog} from "./runtime/runtimeDialog";
import {RuntimeState} from "./runtime/runtimeState";
import {IDuplexChannel} from "@abis/interfaces/dist/duplexChannel";
import {Log} from "@abis/log/dist/log";
import {IDialogContext} from "@abis/interfaces/dist/dialogContext";
import {Session_1_0_0} from "@abis/types/dist/schemas/abis/types/_lib/primitives/_generated/session_1_0_0";

export abstract class Dialog
{
    protected readonly _duplexChannel: IDuplexChannel;
    protected readonly _session: Session_1_0_0;

    private _runtime?:RuntimeDialog<string>;

    protected constructor(duplexChannel: IDuplexChannel, session: Session_1_0_0)
    {
        this._duplexChannel = duplexChannel;
        this._session = session;
    }

    get name()
    {
        return "Dialog:" + this._duplexChannel.ownAgentId + "->" + this._duplexChannel.partnerAgentId;
    }

    private _stopRequest = false;
    private _waitHandles:{resolve:()=>void, reject:(e:any)=>void}[] = [];

    stop()
    {
        this._stopRequest = true;
    }

    protected abstract build(): RuntimeState<string>[];

    async run(): Promise<void>
    {
        if (this._stopRequest) {
            throw new Error("This instance was previously stopped and cannot be restarted.");
        }

        const self = this;
        const context = <IDialogContext>{
            jwt: this._session.jwt,
            session: this._session,
            send(name: string, data: SchemaType): Promise<NewEntry_1_0_0>
            {
                Log.log(self.name, "Sending message '" + name + "' from _Runtime:", data);

                return self.send(name, data);
            },
            async close(): Promise<void>
            {
                Log.log(self.name, "Called 'close()' from _Runtime.");

                self.stop();
            },
            async goto(state: string, seedEvent?: SchemaType): Promise<void>
            {
                Log.log(
                    self.name,
                    "Called 'goto(state: '"
                    + state + "')' from _Runtime "
                    + (seedEvent ? "with seed event:" : ".")
                    , seedEvent);

                if (!self._runtime) {
                    throw new Error("The '_runtime' is not set.")
                }
                await self._runtime.setState(this, state);
                if (seedEvent)
                {
                    await self._runtime.execute(seedEvent);
                }
            }
        };

        this._runtime = new RuntimeDialog<string>(this.build(), context);
        await this._runtime.setState(this._runtime.context, "");

        for (; ;)
        {
            if (this._stopRequest)
            {
                await this._duplexChannel.close();
                break;
            }

            for await (let event of this._duplexChannel.inChannelEvents)
            {
                const payload = (<any>event).data;
                if (!payload)
                {
                    throw new Error("Can't process events without a payload 'data' field.");
                }

                await this._runtime.execute(payload);
                break;
            }

            Log.log(this.name, "Round executed.");
        }

        Log.log(this.name, "Dialog stopped.");

        this._waitHandles.forEach(o => o.resolve());
        this._waitHandles = [];
    }

    async send(name:string, data:SchemaType): Promise<NewEntry_1_0_0>
    {
        return this._duplexChannel.send(name, data);
    }

    async waitUntilFinished()
    {
        return new Promise<void>((resolve, reject) => {
            this._waitHandles.push({
                resolve,
                reject
            });
        });
    }

    private newTimeout<T>(timeoutInMs: number)
    {
        return new Promise<T>(((resolve, reject) =>
        {
            setTimeout(
                () =>
                {
                    const error = new Error("The waiting operation timed out after " + timeoutInMs + " milliseconds.");
                    reject(error);
                },
                timeoutInMs);
        }));
    }
}