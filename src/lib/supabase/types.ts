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
      pos_orders: {
        Row: {
          id: string;
          created_at: string;
          order_number: string;
          customer_name: string | null;
          notes: string | null;
          status: "new" | "preparing" | "done";
          subtotal: number;
          discount_type: "none" | "opening_10" | "google_review_20" | "custom";
          discount_label: string | null;
          discount_rate: number;
          discount_amount: number;
          total: number;
        };
        Insert: {
          id: string;
          created_at?: string;
          order_number: string;
          customer_name?: string | null;
          notes?: string | null;
          status?: "new" | "preparing" | "done";
          subtotal?: number;
          discount_type?: "none" | "opening_10" | "google_review_20" | "custom";
          discount_label?: string | null;
          discount_rate?: number;
          discount_amount?: number;
          total: number;
        };
        Update: {
          created_at?: string;
          order_number?: string;
          customer_name?: string | null;
          notes?: string | null;
          status?: "new" | "preparing" | "done";
          subtotal?: number;
          discount_type?: "none" | "opening_10" | "google_review_20" | "custom";
          discount_label?: string | null;
          discount_rate?: number;
          discount_amount?: number;
          total?: number;
        };
        Relationships: [];
      };
      pos_order_items: {
        Row: {
          id: string;
          order_id: string;
          name: string;
          quantity: number;
          unit_price: number;
          category: string | null;
          notes: string | null;
          gross_line_total: number;
          discount_amount: number;
          net_line_total: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          name: string;
          quantity: number;
          unit_price: number;
          category?: string | null;
          notes?: string | null;
          gross_line_total?: number;
          discount_amount?: number;
          net_line_total?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          order_id?: string;
          name?: string;
          quantity?: number;
          unit_price?: number;
          category?: string | null;
          notes?: string | null;
          gross_line_total?: number;
          discount_amount?: number;
          net_line_total?: number;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pos_order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "pos_orders";
            referencedColumns: ["id"];
          }
        ];
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          stock: number;
          unit: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          stock: number;
          unit: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          stock?: number;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pos_expenses: {
        Row: {
          id: string;
          created_at: string;
          expense_date: string;
          description: string;
          category: "Bahan Baku" | "Gas" | "Listrik" | "Gaji" | "Sewa" | "Peralatan" | "Maintenance" | "Lainnya";
          amount: number;
          payment_method: "Cash" | "QRIS" | "Transfer" | "Kartu";
          vendor: string | null;
          notes: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          expense_date: string;
          description: string;
          category: "Bahan Baku" | "Gas" | "Listrik" | "Gaji" | "Sewa" | "Peralatan" | "Maintenance" | "Lainnya";
          amount: number;
          payment_method?: "Cash" | "QRIS" | "Transfer" | "Kartu";
          vendor?: string | null;
          notes?: string | null;
        };
        Update: {
          created_at?: string;
          expense_date?: string;
          description?: string;
          category?: "Bahan Baku" | "Gas" | "Listrik" | "Gaji" | "Sewa" | "Peralatan" | "Maintenance" | "Lainnya";
          amount?: number;
          payment_method?: "Cash" | "QRIS" | "Transfer" | "Kartu";
          vendor?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_pos_order: {
        Args: {
          order_payload: Json;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
