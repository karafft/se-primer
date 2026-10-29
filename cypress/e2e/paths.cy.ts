// spec.md §4 "Sonuç tablosu": 2 × 2 × 2 = 8 yolun hepsi.
const UP_TIME = { AA: '08:25', AB: '08:20', BA: '08:45', BB: '09:05' } as const;

describe('Tüm yollar baştan sona oynanır', () => {
  for (const k1 of ['A', 'B'] as const)
    for (const k2 of ['A', 'B'] as const)
      for (const k3 of ['A', 'B'] as const) {
        const time = UP_TIME[`${k1}${k2}`];
        it(`K1=${k1} K2=${k2} K3=${k3} → SON ${k3}, sistem ${time}`, () => {
          cy.visit('/');
          cy.startGame();
          cy.decide('mimari', k1);
          cy.decide('test', k2);
          cy.decide('kvkk', k3);
          cy.get('[data-cy=screen-son]').should('have.attr', 'data-ending', k3);
          cy.get('[data-cy=ending-title]').should('contain', `SON ${k3}`);
          cy.get('[data-cy=clock]').should('have.text', time);
          if (k3 === 'A') cy.get('[data-cy=ending-headline]').should('have.text', `${time} sistem ayakta, veri güvende.`);
          else cy.get('[data-cy=ending-headline]').should('have.text', 'Sistem ayakta ama KVKK ihlali.');
          cy.get('[data-cy=timeline-mimari]').should('contain', k1);
        });
      }

  it('Tekrar oyna profili sıfırlar', () => {
    cy.visit('/');
    cy.startGame();
    cy.decide('mimari', 'A');
    cy.decide('test', 'A');
    cy.decide('kvkk', 'A');
    cy.get('[data-cy=restart]').click();
    cy.get('[data-cy=screen-profil]');
    cy.get('[data-cy=profile-done]').should('be.disabled');
  });
});

// KÖ-6 (arkadaş testi): 2. karar 1. kararın sonucuyla tutarlı konuşur.
describe('KÖ-6: 2. karar metni 1. karara uyar', () => {
  it('Geri dönen oyuncu "dönüş paketi" görür, "düzeltme" görmez', () => {
    cy.visit('/');
    cy.startGame();
    cy.decide('mimari', 'A');
    cy.get('[data-cy=prompt]').should('contain', "v2.3'e dönüş paketi hazır.").and('not.contain', 'Düzeltme').and('not.contain', 'Yama');
  });

  it('Yama yapan oyuncu "Yama hazır" görür', () => {
    cy.visit('/');
    cy.startGame();
    cy.decide('mimari', 'B');
    cy.get('[data-cy=prompt]').should('contain', 'Yama hazır.');
  });
});
