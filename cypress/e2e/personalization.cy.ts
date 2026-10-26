// spec.md §5 kişiselleştirme kuralları ve KÖ-3, KÖ-4.
describe('Kişiselleştirme', () => {
  it('KÖ-3: "Yeni başladım" her kararda ipucu görür, süre yok', () => {
    cy.visit('/');
    cy.startGame({ level: 'yeni' });
    for (const id of ['mimari', 'test', 'kvkk'] as const) {
      cy.get(`[data-cy=screen-karar-${id}]`).find('[data-cy=hint]').should('be.visible');
      cy.get('[data-cy=timer]').should('not.exist');
      cy.decide(id, 'A');
    }
  });

  it('"Biraz deneyimim var": ipucu ve süre yok', () => {
    cy.visit('/');
    cy.startGame({ level: 'orta' });
    cy.get('[data-cy=screen-karar-mimari]');
    cy.get('[data-cy=hint]').should('not.exist');
    cy.get('[data-cy=timer]').should('not.exist');
  });

  it('KÖ-4: "Deneyimliyim" 60 sn içinde seçmezse B seçilir', () => {
    cy.clock();
    cy.visit('/');
    cy.startGame({ level: 'deneyimli' });
    cy.get('[data-cy=timer]').should('contain', '60 sn');
    cy.get('[data-cy=hint]').should('not.exist');
    for (let i = 0; i < 59; i++) cy.tick(1000);
    cy.get('[data-cy=timer]').should('contain', '1 sn');
    cy.get('[data-cy=screen-karar-mimari]');
    cy.tick(1000);
    cy.get('[data-cy=screen-sonuc-mimari]');
    cy.get('[data-cy=timeout-note]').should('contain', 'Süre doldu');
    cy.get('[data-cy=impact]').should('contain', '+35 dk');
  });

  it('Deneyimli oyuncu süre dolmadan seçerse not çıkmaz', () => {
    cy.clock();
    cy.visit('/');
    cy.startGame({ level: 'deneyimli' });
    cy.tick(10_000);
    cy.get('[data-cy=choice-A]').click();
    cy.get('[data-cy=timeout-note]').should('not.exist');
  });

  it('Rol giriş sahnesini değiştirir', () => {
    cy.visit('/');
    cy.get('[data-cy=level-orta]').click();
    cy.get('[data-cy=role-test]').click();
    cy.get('[data-cy=goal-test]').click();
    cy.get('[data-cy=profile-done]').click();
    cy.get('[data-cy=role-intro]').should('contain', 'regresyon testlerini sen imzaladın');
  });

  it('Hedef yalnızca eşleşen kararda "Derinleş" gösterir', () => {
    cy.visit('/');
    cy.startGame({ goal: 'kvkk' });
    cy.get('[data-cy=choice-A]').click();
    cy.get('[data-cy=deep-dive]').should('not.exist');
    cy.get('[data-cy=next]').click();
    cy.get('[data-cy=choice-A]').click();
    cy.get('[data-cy=deep-dive]').should('not.exist');
    cy.get('[data-cy=next]').click();
    cy.get('[data-cy=choice-A]').click();
    cy.get('[data-cy=deep-dive]').should('contain', 'Derinleş');
  });
});
