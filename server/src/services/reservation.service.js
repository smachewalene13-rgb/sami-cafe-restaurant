import { query } from '../config/db.js';
import { emitTableUpdate } from '../sockets/index.js';
import { notifyReservationEvent } from './notification.service.js';

export const findAvailableTables = async (date, time, guests) => {
  const sql = `
    SELECT t.id, t.table_number as "tableNumber", t.capacity, t.location, t.status
    FROM restaurant_tables t
    WHERE t.capacity >= $3
      AND NOT EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.table_id = t.id
          AND r.reservation_date = $1
          AND r.status IN ('pending', 'confirmed')
          AND (r.start_time, r.start_time + (r.duration_minutes || ' minutes')::interval)
          OVERLAPS ($2::time, $2::time + interval '90 minutes')
      )
    ORDER BY t.capacity ASC, t.id ASC
  `;

  const result = await query(sql, [date, time, guests]);
  return result.rows;
};

export const createReservation = async (userId, { guestName, phone, reservationDate, startTime, guests, notes, tableId }) => {
  // Check if auto_confirm is enabled
  const settingRes = await query("SELECT value FROM settings WHERE key = 'auto_confirm_reservations'");
  const autoConfirm = settingRes.rows.length > 0 && settingRes.rows[0].value === 'true';
  const initialStatus = autoConfirm ? 'confirmed' : 'pending';

  // If tableId wasn't directly chosen, find best fitting table
  let selectedTableId = tableId;
  if (!selectedTableId) {
    const availableTables = await findAvailableTables(reservationDate, startTime, guests);
    if (availableTables.length > 0) {
      selectedTableId = availableTables[0].id;
    }
  }

  const result = await query(
    `INSERT INTO reservations (user_id, table_id, guest_name, phone, reservation_date, start_time, duration_minutes, guests, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, 90, $7, $8, $9)
     RETURNING id, user_id as "userId", table_id as "tableId", guest_name as "guestName",
               phone, reservation_date as "reservationDate", start_time as "startTime",
               duration_minutes as "durationMinutes", guests, status, notes, created_at as "createdAt"`,
    [userId || null, selectedTableId || null, guestName, phone, reservationDate, startTime, guests, initialStatus, notes || null]
  );

  const reservation = result.rows[0];
  notifyReservationEvent(reservation, false).catch(console.error);

  return reservation;
};

export const updateReservationStatus = async (id, status, tableId) => {
  const valid = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
  if (!valid.includes(status)) throw new Error(`Invalid status: ${status}`);

  const updateFields = ['status = $1'];
  const values = [status, id];
  let idx = 3;

  if (tableId !== undefined) {
    updateFields.push(`table_id = $${idx++}`);
    values.splice(1, 0, tableId);
  }

  const result = await query(
    `UPDATE reservations
     SET ${updateFields.join(', ')}
     WHERE id = $2
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) throw new Error('Reservation not found');
  const updated = result.rows[0];
  notifyReservationEvent(updated, true).catch(console.error);
  return updated;
};
