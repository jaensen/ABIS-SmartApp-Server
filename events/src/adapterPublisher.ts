import {SchemaType} from "@abis/types/dist/schemas/_generated/schemaType";
import {IEventPublisher} from "@abis/interfaces/dist/eventPublisher";

export class AdapterPublisher implements IEventPublisher
{
    target?: IEventPublisher;

    async publish(event: SchemaType, stop?: boolean): Promise<void>
    {
        if (!this.target)
        {
            throw new Error("No target EventPublisher is set on the AdapterPublisher.")
        }
        return this.target.publish(event, stop);
    }
}