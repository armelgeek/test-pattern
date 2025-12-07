import type { Phase } from '../../types/phase.types';

export const COUNTING_TUTORIAL: Phase = {
  id: 'counting-tutorial',
  title: 'Didacticiel : Counting Machine',
  description: 'Apprendre à manipuler les boutons Haut/Bas et les colonnes',
  steps: [
    // --- Étape 1 : Découverte des boutons ---
    {
      id: 'discovery-display',
      action: 'displayNumber',
      data: { number: 0 },
      next: 'discovery-add'
    },
    {
      id: 'discovery-add',
      action: 'showBubble',
      data: { text: "Découverte des boutons : clique sur Haut 3 fois." },
      next: 'discovery-wait-add'
    },
    {
      id: 'discovery-wait-add',
      action: 'waitClicks',
      data: { count: 3, columnIndex: 0, eventType: 'add' },
      next: 'discovery-show-sub'
    },
    {
      id: 'discovery-show-sub',
      action: 'showBubble',
      data: { text: "Maintenant clique sur Bas 3 fois." },
      next: 'discovery-wait-sub'
    },
    {
      id: 'discovery-wait-sub',
      action: 'waitClicks',
      data: { count: 3, columnIndex: 0, eventType: 'subtract' },
      next: 'discovery-validate'
    },
    {
      id: 'discovery-validate',
      action: 'feedback',
      data: { text: 'Cliquez sur Valider pour passer à l\'étape suivante.' },
      next: 'columns-intro'
    },

    // --- Étape 2 : Compréhension des colonnes ---
    {
      id: 'columns-intro',
      action: 'showBubble',
      data: { text: 'Les colonnes sont : Unité, Dizaine, Centaine, Millier.' },
      next: 'columns-1'
    },
    {
      id: 'columns-1',
      action: 'displayNumber',
      data: { number: 1234 },
      next: 'columns-validate-1'
    },
    {
      id: 'columns-validate-1',
      action: 'validate'
    },
    // Répéter avec un deuxième chiffre
    {
      id: 'columns-2',
      action: 'displayNumber',
      data: { number: 2501 },
      next: 'columns-validate-2'
    },
    {
      id: 'columns-validate-2',
      action: 'validate'
    },
    // Troisième chiffre
    {
      id: 'columns-3',
      action: 'displayNumber',
      data: { number: 907 },
      next: 'columns-validate-3'
    },
    {
      id: 'columns-validate-3',
      action: 'validate',
      next: 'columns-feedback'
    },
    {
      id: 'columns-feedback',
      action: 'feedback',
      data: { text: 'Bravo ! Tu as terminé les exercices de colonnes.' },
      next: 'free-practice'
    },

    // --- Étape 3 : Exercices libres ---
    {
      id: 'free-practice',
      action: 'freePractice'
    },

    // --- Fin ---
    {
      id: 'end',
      action: 'end'
    }
  ]
};
