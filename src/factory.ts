import { BaseMessageOptions, CollectedMessageInteraction, CommandInteraction, ComponentType, Message } from "discord.js";
import { MessageCreationOptionBase, sendMessage } from "./utils/messageUtils";


interface ComponentCollectorOptionBase extends MessageCreationOptionBase {
    collectors?: {
        type?: "Button" | "String" | "Both";
        filterWith?: string | ((i: CollectedMessageInteraction) => boolean);
    };
}

/**
 * This function handles creating the requested `options.collectors.type` MessageComponentCollectors, attaching to the provided `anchorMsg`
 * Defaults to one `Button` collector.
 * 
 * @param interaction Base interaction currently active
 * @param anchorMsg Anchor created during collector spawning
 * @param options Additional configuring options
 * @returns All component collectors now attached to the given anchorMsg
 */
function createComponentCollector(
    interaction: CommandInteraction,
    anchorMsg: Message,
    options?: ComponentCollectorOptionBase
) {
    /**
     * Replace with `Assert` logic
     */
    // const hasCollectorOptions = !!(
    //     options &&
    //     options.collectors
    // );

    const applyFilter = (
        options &&
        options.collectors &&
        typeof options.collectors.filterWith === 'string'
    ) ? options.collectors.filterWith : interaction.user.id;
    const filter = (
        options &&
        options.collectors &&
        (options.collectors.filterWith && typeof options.collectors.filterWith !== 'string')
    ) ? options.collectors.filterWith : (i: CollectedMessageInteraction) => i.user.id === applyFilter;

    const buttonCollector = anchorMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter,
        time: (options && options.timeLimit) ? options.timeLimit : 60_000
    });

    const stringCollector = (
        options &&
        options.collectors &&
        options.collectors.type &&
        ['String', 'Both'].includes(options.collectors.type)
    ) ? anchorMsg.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter,
        time: (options && options.timeLimit) ? options.timeLimit : 60_000
    }) : undefined;

    return { b: buttonCollector, s: stringCollector };
}

/**
 * This function handles sending a response to the provided `interaction` then using the returned `message` creates (based on `options.collectors.type`) `messageComponentCollectors`.
 * 
 * @param interaction interaction attached to the current command context called from
 * @param contents Display object to be used as the contents of the `anchorMsg`
 * @param options Additional options object, standard options object with additional `collectors` args
 * @returns Destructable `{ anchorMsg: Message, buttons: ButtonCollector, strings: StringSelectCollector | undefined }`
 */
export async function spawnCollector(
    interaction: CommandInteraction,
    contents: BaseMessageOptions,
    options?: ComponentCollectorOptionBase
) {
    const anchorMsg = await sendMessage(interaction, contents, options);
    const { b, s } = createComponentCollector(interaction, anchorMsg, options);
    return { anchorMsg, buttons: b, strings: s };
}