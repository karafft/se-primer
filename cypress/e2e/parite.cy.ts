// spec.md KÖ-9: diferansiyel test. Oracle: tests/parite.py (Python onnxruntime), hedef: tarayıcıda onnxruntime-web.
import referans from '../../tests/parite.json';

const TOLERANS = 1e-4;

describe('Parite: Python oracle ile uygulama', () => {
  referans.forEach(({ girdi, p }, i) => {
    it(`referans girdi ${i + 1}: fark < ${TOLERANS}`, () => {
      cy.visit(`/?girdi=${encodeURIComponent(JSON.stringify(girdi))}`);
      cy.get('[data-cy=p]', { timeout: 30000 })
        .invoke('text')
        .then((metin) => {
          expect(Math.abs(Number(metin) - p)).to.be.lessThan(TOLERANS);
        });
    });
  });
});
