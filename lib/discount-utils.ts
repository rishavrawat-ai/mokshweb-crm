import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a secure token for email link
 * Returns: { token: string, hash: string, expiresAt: Date }
 */
export function generateSecureToken(requestId: string, superAdminEmail: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const payload = `${requestId}:${superAdminEmail}:${token}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    // Token expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
        token,
        hash,
        expiresAt,
    };
}

/**
 * Verify secure token
 */
export function verifySecureToken(
    requestId: string,
    superAdminEmail: string,
    token: string,
    storedHash: string
): boolean {
    const payload = `${requestId}:${superAdminEmail}:${token}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    return hash === storedHash;
}

/**
 * Generate 6-digit OTP
 * Returns: { otp: string, hash: string, expiresAt: Date }
 */
export async function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await bcrypt.hash(otp, 10);

    // OTP expires in 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    return {
        otp,
        hash,
        expiresAt,
    };
}

/**
 * Verify OTP
 */
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
}

/**
 * Calculate next reminder date based on payment status and rules
 */
export function calculateNextReminder(
    status: string,
    dueDate: Date | null,
    clientCommitmentDate: Date | null
): Date | null {
    const now = new Date();

    // Don't send reminders outside 9am-7pm IST
    const getNextValidTime = (date: Date): Date => {
        const hour = date.getHours();
        if (hour < 9) {
            date.setHours(9, 0, 0, 0);
        } else if (hour >= 19) {
            date.setDate(date.getDate() + 1);
            date.setHours(9, 0, 0, 0);
        }
        return date;
    };

    if (status === 'PAID' || status === 'CANCELLED' || status === 'NOT_RAISED') {
        return null;
    }

    if (status === 'PROMISED' && clientCommitmentDate) {
        // Send reminder 1 day before promise date
        const reminderDate = new Date(clientCommitmentDate);
        reminderDate.setDate(reminderDate.getDate() - 1);

        if (reminderDate > now) {
            return getNextValidTime(reminderDate);
        }

        // If promise date is today or past, send on promise date
        if (new Date(clientCommitmentDate) >= now) {
            return getNextValidTime(new Date(clientCommitmentDate));
        }

        // Promise broken - send in 2 days
        const brokenPromiseReminder = new Date(now);
        brokenPromiseReminder.setDate(brokenPromiseReminder.getDate() + 2);
        return getNextValidTime(brokenPromiseReminder);
    }

    if (status === 'PENDING' && dueDate) {
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue >= 3) {
            // Send T-3 reminder
            const reminder = new Date(dueDate);
            reminder.setDate(reminder.getDate() - 3);
            return getNextValidTime(reminder);
        } else if (daysUntilDue >= 1) {
            // Send T-1 reminder
            const reminder = new Date(dueDate);
            reminder.setDate(reminder.getDate() - 1);
            return getNextValidTime(reminder);
        } else {
            // Send on due date
            return getNextValidTime(new Date(dueDate));
        }
    }

    if (status === 'OVERDUE' && dueDate) {
        const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOverdue < 2) {
            // Send +2 days reminder
            const reminder = new Date(dueDate);
            reminder.setDate(reminder.getDate() + 2);
            return getNextValidTime(reminder);
        } else if (daysOverdue < 5) {
            // Send +5 days reminder
            const reminder = new Date(dueDate);
            reminder.setDate(reminder.getDate() + 5);
            return getNextValidTime(reminder);
        } else {
            // Send +7 days escalation
            const reminder = new Date(dueDate);
            reminder.setDate(reminder.getDate() + 7);
            return getNextValidTime(reminder);
        }
    }

    if (status === 'PARTIAL' && dueDate) {
        // Treat like PENDING
        return calculateNextReminder('PENDING', dueDate, null);
    }

    return null;
}

/**
 * Check if payment is overdue
 */
export function isPaymentOverdue(dueDate: Date | null, status: string): boolean {
    if (!dueDate || status === 'PAID' || status === 'CANCELLED') {
        return false;
    }

    return new Date() > dueDate;
}

/**
 * Check if promise is broken
 */
export function isPromiseBroken(
    status: string,
    clientCommitmentDate: Date | null
): boolean {
    if (status !== 'PROMISED' || !clientCommitmentDate) {
        return false;
    }

    const now = new Date();
    const promiseDate = new Date(clientCommitmentDate);
    const daysPast = Math.ceil((now.getTime() - promiseDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysPast > 2; // 2 days grace period after promise date
}
