// ~60 sn demo videosu: `npm run demo` → cypress/videos/demo.cy.ts.mp4
// Yavaş oynanır ki izleyen okuyabilsin. Diğer testlerden ayrı tutulur.
const pause = (ms = 2500) => cy.wait(ms);

describe('Demo', () => {
  it('Yeni başlayan bir oyuncu baştan sona oynar', () => {
    cy.visit('/');
    pause(4000);
    cy.get('[data-cy=level-yeni]').click();
    pause(800);
    cy.get('[data-cy=role-devops]').click();
    pause(800);
    cy.get('[data-cy=goal-kvkk]').click();
    pause(1200);
    cy.get('[data-cy=profile-done]').click();
    pause(4500);
    cy.get('[data-cy=start]').click();

    pause(3500);
    cy.get('[data-cy=tutor-toggle]').click();
    pause(1500);
    cy.get('[data-cy=tutor-input]').type('Hangisi doğru, sadece harfi söyle', { delay: 40 });
    cy.get('[data-cy=tutor-send]').click();
    pause(4000);
    cy.get('[data-cy=choice-A]').click();
    pause(5000);
    cy.get('[data-cy=next]').click();

    pause(3500);
    cy.get('[data-cy=choice-A]').click();
    pause(4500);
    cy.get('[data-cy=next]').click();

    pause(4500);
    cy.get('[data-cy=choice-A]').click();
    pause(3000);
    cy.get('[data-cy=deep-dive]').scrollIntoView();
    pause(3000);
    cy.get('[data-cy=next]').click();

    pause(5000);
    cy.get('[data-cy=ending-title]').should('contain', 'SON A');
    cy.get('[data-cy=restart]').scrollIntoView();
    pause(6000);
  });
});
