import * as reservationService from '../services/reservation.service.js';
import { query } from '../config/db.js';
import { apiResponse, apiError } from '../utils/apiResponse.js';

export const checkAvailability = async (req, res) => {
  try {
    const { date, time, guests } = req.query;
    if (!date || !time) {
      return apiError(res, 400, 'Date and time are required query parameters');
    }

    const partySize = guests ? parseInt(guests, 10) : 2;
    const availableTables = await reservationService.findAvailableTables(date, time, partySize);

    return apiResponse(res, 200, 'Available tables fetched', {
      available: availableTables.length > 0,
      count: availableTables.length,
      tables: availableTables
    });
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const createReservation = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { guestName, phone, reservationDate, startTime, guests, notes, tableId } = req.body;

    if (!guestName || !phone || !reservationDate || !startTime || !guests) {
      return apiError(res, 400, 'guestName, phone, reservationDate, startTime, and guests are required');
    }

    const reservation = await reservationService.createReservation(userId, {
      guestName,
      phone,
      reservationDate,
      startTime,
      guests: parseInt(guests, 10),
      notes,
      tableId
    });

    return apiResponse(res, 201, 'Table reservation submitted successfully', reservation);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT r.id, r.guest_name as "guestName", r.phone,
              r.reservation_date as "reservationDate", r.start_time as "startTime",
              r.duration_minutes as "durationMinutes", r.guests, r.status, r.notes,
              r.created_at as "createdAt",
              t.table_number as "tableNumber", t.location
       FROM reservations r
       LEFT JOIN restaurant_tables t ON t.id = r.table_id
       WHERE r.user_id = $1
       ORDER BY r.reservation_date DESC, r.start_time DESC`,
      [userId]
    );

    return apiResponse(res, 200, 'Customer reservations', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const { date, status } = req.query;
    let conditions = [];
    let values = [];
    let idx = 1;

    if (date) {
      conditions.push(`r.reservation_date = $${idx++}`);
      values.push(date);
    }

    if (status) {
      conditions.push(`r.status = $${idx++}`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT r.id, r.user_id as "userId", r.guest_name as "guestName", r.phone,
             r.reservation_date as "reservationDate", r.start_time as "startTime",
             r.duration_minutes as "durationMinutes", r.guests, r.status, r.notes,
             r.created_at as "createdAt",
             t.id as "tableId", t.table_number as "tableNumber", t.location
      FROM reservations r
      LEFT JOIN restaurant_tables t ON t.id = r.table_id
      ${whereClause}
      ORDER BY r.reservation_date ASC, r.start_time ASC
    `;

    const result = await query(sql, values);
    return apiResponse(res, 200, 'All reservations', result.rows);
  } catch (err) {
    return apiError(res, 500, err.message);
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tableId } = req.body;
    const updated = await reservationService.updateReservationStatus(id, status, tableId);
    return apiResponse(res, 200, `Reservation status updated to ${status}`, updated);
  } catch (err) {
    return apiError(res, 400, err.message);
  }
};
