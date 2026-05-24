export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          customer_name: string;
          phone: string;
          address: string | null;
          fulfillment_type: "delivery" | "pickup";
          status: string;
          subtotal: number;
          tax: number;
          delivery_fee: number;
          total: number;
          notes: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          phone: string;
          address?: string | null;
          fulfillment_type: "delivery" | "pickup";
          status?: string;
          subtotal: number;
          tax: number;
          delivery_fee: number;
          total: number;
          notes?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          customer_name?: string;
          phone?: string;
          address?: string | null;
          fulfillment_type?: "delivery" | "pickup";
          status?: string;
          subtotal?: number;
          tax?: number;
          delivery_fee?: number;
          total?: number;
          notes?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          name: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          name: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at?: string;
        };
        Update: {
          order_id?: string;
          menu_item_id?: string;
          name?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
