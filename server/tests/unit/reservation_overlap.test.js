import { test, describe } from 'node:test';
import assert from 'node:assert';

function checkTimeOverlap(startA, durationA, startB, durationB) {
  // Convert 'HH:MM' to minutes from midnight
  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const aStart = toMinutes(startA);
  const aEnd = aStart + durationA;
  const bStart = toMinutes(startB);
  const bEnd = bStart + durationB;

  // Overlap condition: startA < endB AND startB < endA
  return aStart < bEnd && bStart < aEnd;
}

describe('Table Reservation Overlap Engine', () => {
  test('Exact same time on same date overlaps', () => {
    const overlaps = checkTimeOverlap('19:00', 90, '19:00', 90);
    assert.strictEqual(overlaps, true);
  });

  test('Booking starting 30 minutes later during duration window overlaps', () => {
    const overlaps = checkTimeOverlap('19:00', 90, '19:30', 90);
    assert.strictEqual(overlaps, true);
  });

  test('Booking starting exactly after 90 minutes does not overlap', () => {
    const overlaps = checkTimeOverlap('19:00', 90, '20:30', 90);
    assert.strictEqual(overlaps, false);
  });

  test('Booking 2 hours apart does not overlap', () => {
    const overlaps = checkTimeOverlap('12:00', 90, '17:00', 90);
    assert.strictEqual(overlaps, false);
  });
});
