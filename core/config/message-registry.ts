import type { MessageRegistry, MessageHandler, MessageDirection } from '../types/bridge-messages.types';

export interface ColumnValuePayload {
    columnIndex: number;
    value: number;
}

export interface PhasePayload {
    phase: string;
}

export interface FeedbackPayload {
    message: string;
}

export interface ButtonPressedPayload {
    action: 'add' | 'subtract';
    columnIndex: number;
}

export interface ColumnLockPayload {
    columnIndex: number;
    locked: boolean;
}

export interface ChallengePayload {
    targets: number[];
}

export interface ValidationPayload {
    total: number;
    target: number;
    success: boolean;
}

export interface AnimationPayload {
    animationType: string;
    columnIndex?: number;
    duration?: number;
}

export interface SpeechPayload {
    message: string;
    voiceId?: string;
}

export const MESSAGE_REGISTRY: MessageRegistry = {
    'SetValue': {
        type: 'SetValue',
        direction: 'toUnity',
    },

    'ChangeList': {
        type: 'ChangeList',
        direction: 'toUnity',
    },
    'LockThousand': {
        type: 'LockThousand',
        direction: 'toUnity',
    },
    'LockHundred': {
        type: 'LockHundred',
        direction: 'toUnity',
    },
    'LockTen': {
        type: 'LockTen',
        direction: 'toUnity',
    },
    'LockUnit': {
        type: 'LockUnit',
        direction: 'toUnity'
    }
};

export function getMessagesByDirection(direction: MessageDirection): string[] {
    return Object.values(MESSAGE_REGISTRY)
        .filter(config => config.direction === direction)
        .map(config => config.type);
}