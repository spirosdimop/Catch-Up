import { storage } from "../storage";
import { InsertBooking } from "@shared/schema";

export const getBookings = () => storage.getBookings();
export const getBookingsByClient = (clientId: number) => storage.getBookingsByClient(clientId);
export const getBooking = (id: number) => storage.getBooking(id);
export const createBooking = (data: InsertBooking) => storage.createBooking(data);
export const updateBooking = (id: number, data: Partial<InsertBooking>) => storage.updateBooking(id, data);
export const deleteBooking = (id: number) => storage.deleteBooking(id);
