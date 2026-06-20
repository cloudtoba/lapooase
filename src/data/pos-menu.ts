// Structured Lapo Oase menu used by the Orders dropdowns. Prices are stored in IDR.
export type MenuCategory = "Food" | "Snacks" | "Beverages" | "Paket Nobar" | "Custom";

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

export const menuCategories: MenuCategory[] = ["Food", "Snacks", "Beverages", "Paket Nobar", "Custom"];

export const menuItems: MenuItemDefinition[] = [
  {
    id: "oase-siak-tolu",
    category: "Food",
    name: "OASE SIAK TOLU",
    basePrice: 0,
    choiceMode: "single",
    helper: "Nasi + lauk goreng garing + tiga sambal.",
    choices: [
      { name: "Manuk / Ayam", price: 25000 },
      { name: "Pork Belly / Babi Goreng", price: 35000 },
      { name: "Lele", price: 20000 },
      { name: "Ikan Mujahir", manualPrice: true, priceHint: "25K - 30K, input sesuai ukuran ikan" }
    ]
  },
  {
    id: "indomie",
    category: "Food",
    name: "Indomie",
    basePrice: 12000,
    choiceMode: "none",
    optionGroups: [
      {
        id: "style",
        label: "Style",
        required: true,
        options: [{ name: "Goreng" }, { name: "Kuah" }]
      },
      {
        id: "topping",
        label: "Topping",
        mode: "multi",
        options: [
          { name: "Polos" },
          { name: "Telur", priceDelta: 5000 },
          { name: "Kornet", priceDelta: 7000 },
          { name: "Sosis", priceDelta: 7000 }
        ]
      }
    ]
  },
  {
    id: "nasi-goreng",
    category: "Food",
    name: "Nasi Goreng",
    basePrice: 12000,
    choiceMode: "none",
    optionGroups: [
      {
        id: "topping",
        label: "Topping",
        mode: "multi",
        options: [
          { name: "Polos" },
          { name: "Telur", priceDelta: 5000 },
          { name: "Kornet", priceDelta: 7000 },
          { name: "Sosis", priceDelta: 7000 }
        ]
      }
    ]
  },
  { id: "tanggo-tanggo-babi", category: "Food", name: "Tanggo Tanggo Babi", basePrice: 35000, choiceMode: "none" },
  { id: "tambul-babi-goreng-siak-tolu", category: "Snacks", name: "Tambul Pork Belly / Babi Goreng Siak Tolu", basePrice: 40000, choiceMode: "none" },
  { id: "kentang-goreng", category: "Snacks", name: "Kentang Goreng", basePrice: 15000, choiceMode: "none" },
  { id: "pisang-goreng-gula-aren", category: "Snacks", name: "Pisang Goreng Gula Aren", basePrice: 15000, choiceMode: "none" },
  { id: "tahu-tempe-goreng", category: "Snacks", name: "Tahu / Tempe Goreng", basePrice: 15000, choiceMode: "none" },
  { id: "roti-bakar-coklat-susu", category: "Snacks", name: "Roti Bakar Coklat Susu", basePrice: 15000, choiceMode: "none" },
  { id: "telor-setengah-matang", category: "Snacks", name: "Telor Setengah Matang", basePrice: 12000, choiceMode: "none", helper: "1 porsi, 2 butir telur ayam kampung." },
  { id: "oase-tuak", category: "Beverages", name: "OASE Tuak", basePrice: 5000, choiceMode: "none" },
  {
    id: "bandrek",
    category: "Beverages",
    name: "Bandrek",
    basePrice: 10000,
    choiceMode: "single",
    choices: [
      { name: "Original", priceDelta: 0 },
      { name: "Susu", priceDelta: 2000 }
    ]
  },
  {
    id: "teh-telur",
    category: "Beverages",
    name: "Teh Telur",
    basePrice: 10000,
    choiceMode: "single",
    choices: [
      { name: "Original", priceDelta: 0 },
      { name: "Susu", priceDelta: 2000 }
    ]
  },
  { id: "stmj", category: "Beverages", name: "STMJ (Susu Telur Madu Jahe)", basePrice: 20000, choiceMode: "none" },
  { id: "teh-manis-panas", category: "Beverages", name: "Teh Manis Panas", basePrice: 5000, choiceMode: "none" },
  { id: "teh-manis-dingin", category: "Beverages", name: "Teh Manis Dingin", basePrice: 7000, choiceMode: "none" },
  { id: "teh-anti-masuk-angin", category: "Beverages", name: "Teh Anti Masuk Angin", basePrice: 9000, choiceMode: "none" },
  {
    id: "oase-latte",
    category: "Beverages",
    name: "OASE Latte",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "OASE Latte", price: 19000 },
      { name: "Spanish Latte", price: 17000 },
      { name: "Matcha Fusion Latte", price: 18000 },
      { name: "Vanilla Caramel Latte", price: 17000 },
      { name: "Coffee Chocolate", price: 17000 }
    ]
  },
  {
    id: "kopi",
    category: "Beverages",
    name: "Kopi",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "Kopi Tubruk", price: 7000 },
      { name: "Black Coffee", price: 7000 },
      { name: "Americano", price: 9000 },
      { name: "Cappuccino", price: 12000 },
      { name: "Mochaccino", price: 13000 },
      { name: "Latte", price: 12000 }
    ]
  },
  { id: "choco-lava", category: "Beverages", name: "Choco Lava", basePrice: 17000, choiceMode: "none" },
  { id: "milo-lava", category: "Beverages", name: "Milo Lava", basePrice: 17000, choiceMode: "none" },
  { id: "taro-lava", category: "Beverages", name: "Taro Lava", basePrice: 16000, choiceMode: "none" },
  { id: "matcha-lava", category: "Beverages", name: "Matcha Lava", basePrice: 18000, choiceMode: "none" },
  {
    id: "paket-tabo",
    category: "Paket Nobar",
    name: "Paket Tabo - Roti Bakar Coklat Susu + Kopi Tubruk",
    basePrice: 20000,
    choiceMode: "none"
  },
  {
    id: "paket-sabas",
    category: "Paket Nobar",
    name: "Paket Sabas - OASE Siak Tolu Babi + Teh Anti Masuk Angin",
    basePrice: 42000,
    choiceMode: "none"
  },
  {
    id: "paket-mamora",
    category: "Paket Nobar",
    name: "Paket Mamora - Indomie Kuah / Goreng + Telor + Bandrek Susu",
    basePrice: 22000,
    choiceMode: "none"
  },
  {
    id: "paket-tanggo-tanggo",
    category: "Paket Nobar",
    name: "Paket Tanggo Tanggo - Tanggo Tanggo Babi + 2 Gelas Tuak",
    basePrice: 40000,
    choiceMode: "none"
  }
];
