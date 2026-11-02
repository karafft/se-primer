// spec.md §10, KÖ-7, KÖ-8: model kararı oyunun davranışını değiştirir. Yalnız Date sahte: model gerçek çalışır.
const BEKLE = { timeout: 30000 };

describe('Model uyumu', () => {
  beforeEach(() => {
    cy.clock(Date.now(), ['Date']);
    cy.visit('/');
  });

  it('KÖ-7: aceleci ve riskli oyuncuya K2 ekranında ipucu çıkar', () => {
    cy.startGame({ level: 'orta' });
    cy.tick(2000);
    cy.get('[data-cy=choice-B]').click();
    cy.tick(2000);
    cy.get('[data-cy=next]').click();
    cy.get('[data-cy=p]', BEKLE);
    cy.get('[data-cy=model-hint]').should('be.visible');
  });

  it('KÖ-8: dikkatli oyuncuya aynı ekranda ipucu çıkmaz', () => {
    cy.startGame({ level: 'orta' });
    cy.tick(20000);
    cy.get('[data-cy=choice-A]').click();
    cy.tick(60000);
    cy.get('[data-cy=next]').click();
    cy.get('[data-cy=p]', BEKLE);
    cy.get('[data-cy=model-hint]').should('not.exist');
  });

  it('Riskli deneyimli oyuncunun K2 süresi kalkar', () => {
    cy.startGame({ level: 'deneyimli' });
    cy.tick(2000);
    cy.get('[data-cy=choice-B]').click();
    cy.tick(2000);
    cy.get('[data-cy=next]').click();
    cy.get('[data-cy=model-sure-kalkti]', BEKLE).should('be.visible');
    cy.get('[data-cy=timer]').should('not.exist');
  });

  it('Veri toplama modunda model kapalı, CSV üretilir', () => {
    cy.visit('/?topla=1');
    cy.startGame({ level: 'orta' });
    cy.decide('mimari', 'B');
    cy.get('[data-cy=screen-karar-test]');
    cy.get('[data-cy=model-hint]').should('not.exist');
    cy.decide('test', 'A');
    cy.decide('kvkk', 'A');
    cy.get('[data-cy=screen-son]');
    cy.get('[data-cy=veri-csv]')
      .invoke('val')
      .then((csv) => {
        const satirlar = String(csv).trim().split('\n');
        expect(satirlar).to.have.length(4);
        expect(satirlar[1]).to.contain(',gercek,1,1,0,');
        expect(satirlar[1].endsWith(',0,1')).to.equal(true);
        expect(satirlar[2]).to.contain(',gercek,1,2,1,');
      });
  });
});
