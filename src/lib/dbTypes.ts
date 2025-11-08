export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          quantity: number;
          price: number;
        };
        Insert: {
          name: string;
          quantity: number;
          price: number;
        };
        Update: {
          name?: string;
          quantity?: number;
          price?: number;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
