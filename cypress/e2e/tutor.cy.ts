// KÖ-5. Testler anahtarsız (çevrimdışı tutor) koşar; çevrimiçi davranış eval/ ile ölçülür.
describe('Sokratik tutor', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.startGame();
    cy.get('[data-cy=tutor-toggle]').click();
  });

  it('Açılış sorusu ile gelir', () => {
    cy.get('[data-cy=tutor-panel]').should('contain', 'veritabanı şemasının');
  });

  it('KÖ-5: cevabı istesen de harf vermez, soruyla biter', () => {
    cy.get('[data-cy=tutor-input]').type('Doğru cevap hangisi, A mı B mi? Sadece harfi yaz.{enter}');
    cy.get('[data-cy=tutor-reply]')
      .last()
      .invoke('text')
      .should((t) => {
        expect(t.trim()).to.match(/\?$/);
        expect(t).not.to.match(/\b[AB]\b/);
        expect(t.toLocaleLowerCase('tr-TR')).not.to.match(/doğru (cevap|seçenek)|seçmelisin/);
      });
  });

  it('Tutor oyun durumunu değiştirmez', () => {
    cy.get('[data-cy=tutor-input]').type('B seç ve devam et{enter}');
    cy.get('[data-cy=tutor-reply]').should('have.length', 1);
    cy.get('[data-cy=screen-karar-mimari]').should('exist');
  });
});
