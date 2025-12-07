# Exemple Avancé - Orchestration Complexe

Ce document explique comment créer une orchestration plus complexe avec plusieurs interactions Unity.

## 📋 Scénario: Jeu de Quiz

Créons un jeu de quiz qui démontre des interactions plus complexes avec Unity.

### 1. Définir les messages du jeu

```typescript
// quiz-game-messages.ts
import type { MessageRegistry } from '../core/types/bridge-messages.types';

export const QUIZ_GAME_MESSAGES: MessageRegistry = {
  // Messages vers Unity
  'QUIZ_STARTED': {
    type: 'QUIZ_STARTED',
    direction: 'toUnity',
  },
  'QUESTION_DISPLAYED': {
    type: 'QUESTION_DISPLAYED',
    direction: 'toUnity',
  },
  'SHOW_OPTIONS': {
    type: 'SHOW_OPTIONS',
    direction: 'toUnity',
  },
  'ANSWER_CORRECT': {
    type: 'ANSWER_CORRECT',
    direction: 'toUnity',
  },
  'ANSWER_WRONG': {
    type: 'ANSWER_WRONG',
    direction: 'toUnity',
  },
  'SCORE_UPDATED': {
    type: 'SCORE_UPDATED',
    direction: 'toUnity',
  },
  'QUIZ_COMPLETED': {
    type: 'QUIZ_COMPLETED',
    direction: 'toUnity',
  },

  // Messages depuis Unity
  'OPTION_SELECTED': {
    type: 'OPTION_SELECTED',
    direction: 'fromUnity',
  },
  'NEXT_QUESTION': {
    type: 'NEXT_QUESTION',
    direction: 'fromUnity',
  },
  'QUIZ_RESTART': {
    type: 'QUIZ_RESTART',
    direction: 'fromUnity',
  },
};
```

### 2. Créer une phase de question

```typescript
// quiz-question-phase.ts
import { PhaseBase } from '../core/phases/abstract-phase';
import { StateManager } from '../core/phases/state';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

export class QuizQuestionPhase extends PhaseBase {
  constructor(
    private question: Question,
    private onCorrect: () => void,
    private onWrong: () => void
  ) {
    super(`question-${question.id}`, `Question ${question.id}`);
  }

  async start(stateManager: StateManager): Promise<void> {
    console.log(`Question: ${this.question.text}`);
    
    // Envoyer la question à Unity
    this.sendToUnity(stateManager, 'QUESTION_DISPLAYED', {
      id: this.question.id,
      text: this.question.text,
    });

    // Envoyer les options à Unity
    this.sendToUnity(stateManager, 'SHOW_OPTIONS', {
      options: this.question.options,
    });

    // Écouter la sélection de l'utilisateur
    this.onUnityMessage<{ optionIndex: number }>(
      stateManager,
      'OPTION_SELECTED',
      (data) => {
        const isCorrect = data.optionIndex === this.question.correctIndex;
        
        if (isCorrect) {
          console.log('✅ Bonne réponse!');
          this.sendToUnity(stateManager, 'ANSWER_CORRECT', {
            questionId: this.question.id,
          });
          this.onCorrect();
        } else {
          console.log('❌ Mauvaise réponse!');
          this.sendToUnity(stateManager, 'ANSWER_WRONG', {
            questionId: this.question.id,
            correctIndex: this.question.correctIndex,
          });
          this.onWrong();
        }
        
        // Attendre que l'utilisateur soit prêt pour la prochaine question
        this.onUnityMessage(stateManager, 'NEXT_QUESTION', () => {
          this.complete();
        });
      }
    );

    // Pour la démo sans Unity, auto-compléter après 3 secondes
    setTimeout(() => {
      if (!this.isCompleted()) {
        console.log('Auto-complétion (démo)');
        this.complete();
      }
    }, 3000);
  }
}
```

### 3. Créer l'orchestrateur du quiz

```typescript
// quiz-game-orchestrator.ts
import { GameOrchestrator } from '../core/phases/game-orchestrator';
import { StateManager } from '../core/phases/state';
import { PhaseBase } from '../core/phases/abstract-phase';
import { QuizQuestionPhase } from './quiz-question-phase';

interface QuizGameState {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
}

const QUESTIONS = [
  {
    id: 1,
    text: 'Quelle est la capitale de la France?',
    options: ['Londres', 'Paris', 'Berlin', 'Madrid'],
    correctIndex: 1,
  },
  {
    id: 2,
    text: 'Combien font 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctIndex: 1,
  },
  {
    id: 3,
    text: 'Quelle est la couleur du ciel?',
    options: ['Rouge', 'Vert', 'Bleu', 'Jaune'],
    correctIndex: 2,
  },
];

export class QuizGameOrchestrator extends GameOrchestrator<QuizGameState> {
  protected getDefaultGameState(): QuizGameState {
    return {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
    };
  }

  protected setupPhases(): PhaseBase[] {
    const phases: PhaseBase[] = [];

    // Phase d'introduction
    phases.push(new IntroPhase());

    // Créer une phase pour chaque question
    QUESTIONS.forEach((question) => {
      phases.push(
        new QuizQuestionPhase(
          question,
          () => this.handleCorrectAnswer(),
          () => this.handleWrongAnswer()
        )
      );
    });

    // Phase de conclusion
    phases.push(new ConclusionPhase());

    return phases;
  }

  private handleCorrectAnswer(): void {
    const state = this.getGameState();
    this.updateGameState({
      score: state.score + 10,
      questionsAnswered: state.questionsAnswered + 1,
      correctAnswers: state.correctAnswers + 1,
    });

    // Notifier Unity du nouveau score
    if (this.bridge) {
      this.bridge.send('SCORE_UPDATED', {
        score: this.getGameState().score,
      });
    }
  }

  private handleWrongAnswer(): void {
    const state = this.getGameState();
    this.updateGameState({
      questionsAnswered: state.questionsAnswered + 1,
    });
  }

  protected onComplete(): void {
    const state = this.getGameState();
    console.log('🎉 Quiz terminé!');
    console.log(`Score final: ${state.score}`);
    console.log(`Bonnes réponses: ${state.correctAnswers}/${state.questionsAnswered}`);

    // Notifier Unity
    if (this.bridge) {
      this.bridge.send('QUIZ_COMPLETED', {
        score: state.score,
        correctAnswers: state.correctAnswers,
        totalQuestions: state.questionsAnswered,
      });
    }
  }
}

class IntroPhase extends PhaseBase {
  constructor() {
    super('intro', 'Introduction au Quiz');
  }

  async start(stateManager: StateManager): Promise<void> {
    this.sendToUnity(stateManager, 'QUIZ_STARTED', {
      totalQuestions: QUESTIONS.length,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    this.complete();
  }
}

class ConclusionPhase extends PhaseBase {
  constructor() {
    super('conclusion', 'Résultats');
  }

  async start(stateManager: StateManager): Promise<void> {
    console.log('Affichage des résultats...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.complete();
  }
}
```

### 4. Utilisation

```typescript
// main.ts
import { StateManager } from '../core/phases/state';
import { MockUnityBridge } from './mock-unity-bridge';
import { QuizGameOrchestrator } from './quiz-game-orchestrator';
import { QUIZ_GAME_MESSAGES } from './quiz-game-messages';

const bridge = new MockUnityBridge(QUIZ_GAME_MESSAGES, true);
const stateManager = new StateManager({}, undefined, bridge);
const orchestrator = new QuizGameOrchestrator(stateManager, bridge);

// Écouter les changements d'état du jeu
stateManager.on('gameStateChanged', (data) => {
  console.log('📊 Score:', data.gameState.score);
  console.log('📈 Progression:', 
    `${data.gameState.questionsAnswered}/${QUESTIONS.length}`);
});

// Démarrer le quiz
orchestrator.initialize();
orchestrator.start();

// Simuler des réponses Unity (pour la démo)
setTimeout(() => {
  bridge.simulateUnityMessage('OPTION_SELECTED', { optionIndex: 1 });
}, 2000);
```

## 🎯 Points clés démontrés

### 1. Communication bidirectionnelle complexe
- Envoi de questions à Unity
- Réception des réponses de Unity
- Envoi des feedbacks (correct/incorrect)
- Gestion du flow avec NEXT_QUESTION

### 2. State Management avancé
- Tracking du score
- Comptage des réponses correctes
- Progression dans le quiz

### 3. Callbacks et handlers
- Callbacks pour réponse correcte/incorrecte
- Handlers Unity avec auto-cleanup
- Gestion asynchrone des interactions

### 4. Orchestration dynamique
- Création dynamique de phases basée sur les données
- Phases créées en boucle pour chaque question
- Flow flexible adapté au nombre de questions

## 🔄 Variantes possibles

### Variante 1: Timer par question
```typescript
export class TimedQuizQuestionPhase extends QuizQuestionPhase {
  private timeLimit = 10000; // 10 secondes

  async start(stateManager: StateManager): Promise<void> {
    // Démarrer le timer
    const timeout = setTimeout(() => {
      if (!this.isCompleted()) {
        console.log('⏱️ Temps écoulé!');
        this.onWrong();
        this.complete();
      }
    }, this.timeLimit);

    this.addCleanup(() => clearTimeout(timeout));

    // Appeler la logique parent
    await super.start(stateManager);
  }
}
```

### Variante 2: Phases avec retry
```typescript
export class RetryableQuestionPhase extends QuizQuestionPhase {
  private maxAttempts = 3;
  private attempts = 0;

  async start(stateManager: StateManager): Promise<void> {
    this.onUnityMessage<{ optionIndex: number }>(
      stateManager,
      'OPTION_SELECTED',
      (data) => {
        this.attempts++;
        const isCorrect = data.optionIndex === this.question.correctIndex;
        
        if (isCorrect) {
          this.onCorrect();
          this.complete();
        } else if (this.attempts >= this.maxAttempts) {
          console.log('Nombre maximum de tentatives atteint');
          this.onWrong();
          this.complete();
        } else {
          console.log(`Essaie encore! (${this.attempts}/${this.maxAttempts})`);
          this.sendToUnity(stateManager, 'ANSWER_WRONG', {
            attemptsLeft: this.maxAttempts - this.attempts,
          });
        }
      }
    );
  }
}
```

### Variante 3: Phases avec hints
```typescript
export class HintableQuestionPhase extends QuizQuestionPhase {
  async start(stateManager: StateManager): Promise<void> {
    // Écouter les demandes de hint
    this.onUnityMessage(stateManager, 'REQUEST_HINT', () => {
      this.sendToUnity(stateManager, 'SHOW_HINT', {
        hint: this.getHint(),
      });
    });

    await super.start(stateManager);
  }

  private getHint(): string {
    // Éliminer une mauvaise réponse
    const wrongOptions = this.question.options
      .map((opt, idx) => idx)
      .filter(idx => idx !== this.question.correctIndex);
    
    return `Ce n'est pas: ${this.question.options[wrongOptions[0]]}`;
  }
}
```

## 🎨 UI Unity correspondante

Pour une intégration complète avec Unity, créez:

### 1. GameObject WebBridge
```csharp
public class WebBridge : MonoBehaviour
{
    public void ReceiveStringMessageFromJs(string messageJson)
    {
        var message = JsonUtility.FromJson<Message>(messageJson);
        // Router le message vers le bon handler
    }
    
    public void SendToWeb(string type, object data)
    {
        var message = new { type, data };
        var json = JsonUtility.ToJson(message);
        Application.ExternalCall("receiveUnityMessage", json);
    }
}
```

### 2. UI Components
- QuestionDisplay: affiche la question
- OptionsPanel: affiche les options cliquables
- ScoreDisplay: affiche le score en temps réel
- FeedbackPanel: affiche correct/incorrect

Cette architecture permet une séparation claire entre:
- **Logique métier**: dans l'orchestrateur (TypeScript)
- **Rendu visuel**: dans Unity
- **Communication**: via le bridge avec messages typés
