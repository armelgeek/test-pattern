export interface BaseMessage {
  type: string;
  timestamp?: number;
}

export interface MessagePayload {
  [key: string]: any;
}

export interface TypedMessage<T extends string = string, P = MessagePayload> extends BaseMessage {
  type: T;
  data: P;
}

export type MessageDirection = 'toUnity' | 'fromUnity' | 'bidirectional';

export interface MessageConfig<T extends string = string> {
  type: T;
  direction: MessageDirection;
  schema?: any;
  handler?: MessageHandler<any>;
}

export type MessageHandler<P = MessagePayload> = (data: P) => void | Promise<void>;

export interface MessageRegistry {
  [messageType: string]: MessageConfig;
}