type Level = 'yeni' | 'orta' | 'deneyimli';
type Role = 'backend' | 'test' | 'devops';
type Goal = 'mimari' | 'test' | 'kvkk';

declare global {
  namespace Cypress {
    interface Chainable {
      startGame(profile?: { level?: Level; role?: Role; goal?: Goal }): Chainable<void>;
      decide(id: Goal, choice: 'A' | 'B'): Chainable<void>;
    }
  }
}

Cypress.Commands.add('startGame', ({ level = 'orta', role = 'backend', goal = 'mimari' } = {}) => {
  cy.get('[data-cy=screen-profil]');
  cy.get(`[data-cy=level-${level}]`).click();
  cy.get(`[data-cy=role-${role}]`).click();
  cy.get(`[data-cy=goal-${goal}]`).click();
  cy.get('[data-cy=profile-done]').click();
  cy.get('[data-cy=screen-giris]');
  cy.get('[data-cy=start]').click();
});

Cypress.Commands.add('decide', (id, choice) => {
  cy.get(`[data-cy=screen-karar-${id}]`);
  cy.get(`[data-cy=choice-${choice}]`).click();
  cy.get(`[data-cy=screen-sonuc-${id}]`);
  cy.get('[data-cy=what]').should('not.be.empty');
  cy.get('[data-cy=why]').should('not.be.empty');
  cy.get('[data-cy=next]').click();
});

export {};
