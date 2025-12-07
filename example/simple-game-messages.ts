import type { MessageRegistry } from '../core/types/bridge-messages.types';

/**
 * Message registry pour le jeu d'exemple simple
 * Définit tous les messages que le jeu peut envoyer/recevoir avec Unity
 */
export const SIMPLE_GAME_MESSAGES: MessageRegistry = {
  // Messages vers Unity (toUnity)
  'GAME_STARTED': {
    type: 'GAME_STARTED',
    direction: 'toUnity',
  },
  'PHASE_CHANGED': {
    type: 'PHASE_CHANGED',
    direction: 'toUnity',
  },
  'SHOW_MESSAGE': {
    type: 'SHOW_MESSAGE',
    direction: 'toUnity',
  },
  'COUNTER_UPDATED': {
    type: 'COUNTER_UPDATED',
    direction: 'toUnity',
  },
  'GAME_COMPLETED': {
    type: 'GAME_COMPLETED',
    direction: 'toUnity',
  },

  // Messages depuis Unity (fromUnity)
  'BUTTON_CLICKED': {
    type: 'BUTTON_CLICKED',
    direction: 'fromUnity',
  },
  'USER_INPUT': {
    type: 'USER_INPUT',
    direction: 'fromUnity',
  },
  'UNITY_READY': {
    type: 'UNITY_READY',
    direction: 'fromUnity',
  },

  // Messages bidirectionnels
  'RESET_GAME': {
    type: 'RESET_GAME',
    direction: 'bidirectional',
  },
};
