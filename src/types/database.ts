export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus = "pending" | "paid" | "expired";
export type PaymentMethod = "multibanco" | "mbway";

export type EventCategory =
  | "Música"
  | "Comida & Bebida"
  | "Cultura"
  | "Desporto"
  | "Festivais"
  | "Teatro"
  | "Outros";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
      organizers: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          verified: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          verified?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          verified?: boolean;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          category: string;
          start_date: string;
          end_date: string;
          location: string;
          city: string;
          price_from: number;
          organizer_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          category: string;
          start_date: string;
          end_date: string;
          location: string;
          city: string;
          price_from?: number;
          organizer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          name: string;
          description?: string | null;
          price?: number | null;
          time_limit?: string | null;
          badge?: string | null;
          badge_color?: "gold" | "green" | "red" | null;
          includes?: string[] | null;
          stock_total: number;
          stock_sold?: number;
          created_at?: string;
        };
      };
      ticket_types: {
        Row: {
          id: string;
          event_id: string | null;
          name: string;
          description: string | null;
          price: number | null;
          time_limit: string | null;
          badge: string | null;
          badge_color: "gold" | "green" | "red" | null;
          includes: string[] | null;
          stock_total: number;
          stock_sold: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          name: string;
          description?: string | null;
          price?: number | null;
          time_limit?: string | null;
          badge?: string | null;
          badge_color?: "gold" | "green" | "red" | null;
          includes?: string[] | null;
          stock_total: number;
          stock_sold?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          name?: string;
          price?: number;
          stock_total?: number;
          stock_sold?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          total_amount: number;
          status: OrderStatus;
          payment_method: PaymentMethod;
          ifthenpay_id: string | null;
          payment_reference: string | null;
          payment_entity: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          total_amount: number;
          status?: OrderStatus;
          payment_method: PaymentMethod;
          ifthenpay_id?: string | null;
          payment_reference?: string | null;
          payment_entity?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          total_amount?: number;
          status?: OrderStatus;
          payment_method?: PaymentMethod;
          ifthenpay_id?: string | null;
          payment_reference?: string | null;
          payment_entity?: string | null;
          created_at?: string;
        };
      };
      user_tickets: {
        Row: {
          id: string;
          order_id: string | null;
          user_id: string | null;
          ticket_type_id: string | null;
          qr_code_hash: string;
          validated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          user_id?: string | null;
          ticket_type_id?: string | null;
          qr_code_hash: string;
          validated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          user_id?: string | null;
          ticket_type_id?: string | null;
          qr_code_hash?: string;
          validated?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organizer = Database["public"]["Tables"]["organizers"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type TicketType = Database["public"]["Tables"]["ticket_types"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type UserTicket = Database["public"]["Tables"]["user_tickets"]["Row"];

export type EventWithOrganizer = Event & {
  organizers: Organizer | null;
};

export type EventWithTickets = EventWithOrganizer & {
  ticket_types: TicketType[];
};
