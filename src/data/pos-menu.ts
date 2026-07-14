// Structured Lapo Oase menu used by the Orders dropdowns. Prices are stored in IDR.
export type MenuCategory = "Food" | "Snacks" | "Beverages" | "Custom";

export type ChoiceMode = "none" | "single" | "multi";

export type MenuChoice = {
  name: string;
  price?: number;
  priceDelta?: number;
  manualPrice?: boolean;
  priceHint?: string;
};

export type MenuOptionGroup = {
  id: string;
  label: string;
  mode?: "single" | "multi";
  required?: boolean;
  options: MenuChoice[];
};

export type MenuItemDefinition = {
  id: string;
  category: MenuCategory;
  name: string;
  basePrice: number;
  choiceMode: ChoiceMode;
  choices?: MenuChoice[];
  optionGroups?: MenuOptionGroup[];
  helper?: string;
  temperatureOptions?: MenuChoice[];
};

export const menuCategories: MenuCategory[] = ["Food", "Snacks", "Beverages", "Custom"];

export const menuItems: MenuItemDefinition[] = [
  { id: "ayam-penyet", category: "Food", name: "Ayam Penyet", basePrice: 25000, choiceMode: "none", helper: "Sudah termasuk nasi & sayur." },
  { id: "lele-penyet", category: "Food", name: "Lele Penyet", basePrice: 20000, choiceMode: "none", helper: "Sudah termasuk nasi & sayur." },
  { id: "tanggo-tanggo-babi", category: "Food", name: "Tanggo Tanggo Babi", basePrice: 35000, choiceMode: "none" },
  { id: "saksang-babi", category: "Food", name: "Saksang Babi", basePrice: 35000, choiceMode: "none" },
  {
    id: "ikan-mujahir",
    category: "Food",
    name: "Ikan Mujahir",
    basePrice: 0,
    choiceMode: "single",
    helper: "Sesuai ukuran.",
    choices: [
      { name: "Sesuai ukuran", manualPrice: true, priceHint: "25K - 35K, input sesuai ukuran ikan" }
    ]
  },
  {
    id: "indomie-telor",
    category: "Food",
    name: "Indomie Telor",
    basePrice: 17000,
    choiceMode: "none",
    optionGroups: [
      {
        id: "style",
        label: "Style",
        required: true,
        options: [{ name: "Goreng" }, { name: "Kuah" }]
      }
    ]
  },
  {
    id: "nasi-goreng-telor",
    category: "Food",
    name: "Nasi Goreng Telor",
    basePrice: 17000,
    choiceMode: "none",
    optionGroups: [
      {
        id: "topping",
        label: "Topping",
        mode: "multi",
        options: [
          { name: "Polos" },
          { name: "Daging", priceDelta: 5000 }
        ]
      }
    ]
  },
  { id: "kentang-goreng", category: "Snacks", name: "Kentang Goreng", basePrice: 15000, choiceMode: "none" },
  { id: "pisang-goreng", category: "Snacks", name: "Pisang Goreng", basePrice: 15000, choiceMode: "none" },
  { id: "tahu-tempe-goreng", category: "Snacks", name: "Tahu Tempe Goreng", basePrice: 15000, choiceMode: "none" },
  { id: "roti-bakar-coklat-susu", category: "Snacks", name: "Roti Bakar Coklat Susu", basePrice: 15000, choiceMode: "none" },
  { id: "roti-bakar-coklat-keju", category: "Snacks", name: "Roti Bakar Coklat Keju", basePrice: 17000, choiceMode: "none" },
  { id: "telor-setengah-matang", category: "Snacks", name: "Telor Setengah Matang", basePrice: 10000, choiceMode: "none", helper: "1 porsi, 2 butir telur ayam kampung." },
  { id: "bandrek-susu", category: "Beverages", name: "Bandrek Susu", basePrice: 12000, choiceMode: "none" },
  {
    id: "teh-telur",
    category: "Beverages",
    name: "Teh Telur",
    basePrice: 10000,
    choiceMode: "none",
    optionGroups: [
      {
        id: "topping",
        label: "Topping",
        mode: "multi",
        options: [
          { name: "Polos" },
          { name: "Susu", priceDelta: 2000 }
        ]
      }
    ]
  },
  { id: "teh-susu", category: "Beverages", name: "Teh Susu", basePrice: 8000, choiceMode: "none" },
  { id: "stmj", category: "Beverages", name: "STMJ (Susu Telur Madu Jahe)", basePrice: 17000, choiceMode: "none" },
  { id: "lemon-tea", category: "Beverages", name: "Lemon Tea", basePrice: 10000, choiceMode: "none" },
  { id: "teh-manis-panas", category: "Beverages", name: "Teh Manis Panas", basePrice: 5000, choiceMode: "none" },
  { id: "teh-manis-dingin", category: "Beverages", name: "Teh Manis Dingin", basePrice: 7000, choiceMode: "none" },
  { id: "teh-anti-masuk-angin", category: "Beverages", name: "Teh Anti Masuk Angin", basePrice: 10000, choiceMode: "none" },
  {
    id: "spesial-kopi",
    category: "Beverages",
    name: "Spesial Kopi",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "OASE Latte", price: 17000 },
      { name: "Spanish Latte", price: 17000 },
      { name: "Matcha Fusion Latte", price: 18000 },
      { name: "Vanilla Caramel Latte", price: 17000 },
      { name: "Coffee Chocolate", price: 17000 }
    ]
  },
  {
    id: "kopi-tubruk",
    category: "Beverages",
    name: "Kopi Tubruk",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "Black Coffee", price: 8000 },
      { name: "Americano", price: 12000 },
      { name: "Capuccino", price: 15000 },
      { name: "Moccacino", price: 15000 },
      { name: "Latte", price: 15000 },
      { name: "Kopi Susu", price: 10000 }
    ]
  },
  { id: "choco-lava", category: "Beverages", name: "Choco Lava", basePrice: 17000, choiceMode: "none" },
  { id: "milo-lava", category: "Beverages", name: "Milo Lava", basePrice: 17000, choiceMode: "none" },
  { id: "taro-lava", category: "Beverages", name: "Taro Lava", basePrice: 16000, choiceMode: "none" },
  { id: "matcha-lava", category: "Beverages", name: "Matcha Lava", basePrice: 18000, choiceMode: "none" }
];
