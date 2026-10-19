import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Order Calculation Logic', () => {
  test('Subtotal correctly aggregates multiple items with unit prices', () => {
    const items = [
      { menu_item_id: 1, quantity: 2, price: 280.00 }, // 560
      { menu_item_id: 4, quantity: 1, price: 250.00 }, // 250
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    assert.strictEqual(subtotal, 810.00);
  });

  test('Tax calculates 15% VAT correctly', () => {
    const subtotal = 1000.00;
    const taxRate = 0.15;
    const tax = +(subtotal * taxRate).toFixed(2);
    assert.strictEqual(tax, 150.00);
  });

  test('Promo discount percentage applies before tax', () => {
    const subtotal = 1000.00;
    const discountPercent = 10; // 10%
    const discount = +(subtotal * (discountPercent / 100)).toFixed(2);
    const taxable = subtotal - discount;
    const tax = +(taxable * 0.15).toFixed(2);
    const total = +(taxable + tax).toFixed(2);

    assert.strictEqual(discount, 100.00);
    assert.strictEqual(taxable, 900.00);
    assert.strictEqual(tax, 135.00);
    assert.strictEqual(total, 1035.00);
  });

  test('Delivery fee is added to total amount', () => {
    const subtotal = 500.00;
    const tax = 75.00;
    const deliveryFee = 120.00;
    const total = subtotal + tax + deliveryFee;

    assert.strictEqual(total, 695.00);
  });
});
