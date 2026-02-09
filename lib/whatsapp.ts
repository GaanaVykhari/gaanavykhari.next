import { formatTime } from '@/lib/scheduleUtils';

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function openWhatsApp(phone: string, message: string) {
  const cleaned = phone.replace(/\D/g, '');
  const withCountry = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
  const url = `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function sendCancellationMessage(
  phone: string,
  name: string,
  date: Date,
  time: string
) {
  const message = `Hi ${name},

This is to inform you that your music class scheduled for ${formatShortDate(date)} at ${formatTime(time)} has been cancelled.

- GaanaVykhari`;

  openWhatsApp(phone, message);
}

export function sendRescheduleMessage(
  phone: string,
  name: string,
  originalDate: Date,
  originalTime: string,
  newDate: Date,
  newTime: string
) {
  const message = `Hi ${name},

This is to inform you that your music class scheduled for ${formatShortDate(originalDate)} at ${formatTime(originalTime)} has been rescheduled to ${formatShortDate(newDate)} at ${formatTime(newTime)}.

- GaanaVykhari`;

  openWhatsApp(phone, message);
}

export function sendHolidayMessage(
  phone: string,
  name: string,
  fromDate: Date,
  toDate: Date,
  description?: string
) {
  const reason = description || 'a holiday';
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const isSingleDay = from.toDateString() === to.toDateString();

  const dateText = isSingleDay
    ? `on ${formatShortDate(from)}`
    : `from ${formatShortDate(from)} to ${formatShortDate(to)}`;

  const message = `Hi ${name},

This is to inform you that classes are cancelled ${dateText} due to ${reason}.

- GaanaVykhari`;

  openWhatsApp(phone, message);
}
