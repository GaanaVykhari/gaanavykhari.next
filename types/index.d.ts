export interface IStudent {
  _id?: string;
  name: string;
  phone: string;
  email: string;
  fees: {
    perClasses: number;
    amount: number;
  };
  schedule: {
    frequency: 'monthly' | 'weekly' | 'fortnightly' | 'daily';
    daysOfTheWeek: number[];
    daysOfTheMonth: number[];
    time: string;
  };
  inductionDate: Date;
  lastClassDate: Date | null;
}

export type ISessionStatus = 'attended' | 'canceled' | 'missed' | 'scheduled';

export interface IPayment {
  _id?: string;
  student: string;
  dueDate: Date;
  amount: number;
  status: 'paid' | 'pending';
  paymentUrl: string;
  paidDate: Date | null;
}

export interface ISession {
  _id?: string;
  student: string;
  date: Date;
  status: ISessionStatus;
}

export interface IHoliday {
  _id?: string;
  date: Date;
}

export interface IUser {
  _id?: string;
  name: string;
  username: string; // For Google login, this will be the email
  password?: string; // Made optional for Google login
}

export interface IToken {
  _id?: string;
  user: string;
  token: string;
  expiresAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  ok: boolean;
  message: string;
  token?: string;
  data?: {
    name: string;
    username: string;
    _id: string;
  };
}

// Extend NextAuth session and JWT types
declare module 'next-auth' {
  interface Session {
    backendToken?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    __backendToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    backendToken?: string;
  }
}
