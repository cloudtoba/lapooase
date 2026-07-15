// Structured Lapo Oase menu used by the Orders dropdowns. Prices are stored in IDR.
export type MenuCategory = "Makanan" | "Snacks" | "Minuman" | "Custom";

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

export const menuCategories: MenuCategory[] = ["Makanan", "Minuman", "Snacks", "Custom"];

export const menuItems: MenuItemDefinition[] = [
  { id: "indomie-telor-kuah", category: "Makanan", name: "Intel Kuah", basePrice: 17000, choiceMode: "none" },
  { id: "indomie-telor-goreng", category: "Makanan", name: "Intel Grg", basePrice: 17000, choiceMode: "none" },
  { id: "nasi-goreng-telor", category: "Makanan", name: "Nasgor", basePrice: 17000, choiceMode: "none" },
  { id: "nasi-goreng-telor-daging", category: "Makanan", name: "Nasgor ++", basePrice: 22000, choiceMode: "none" },
  { id: "ayam-penyet", category: "Makanan", name: "Ayam P", basePrice: 25000, choiceMode: "none", helper: "Sudah termasuk nasi & sayur." },
  { id: "lele-penyet", category: "Makanan", name: "Lele P", basePrice: 20000, choiceMode: "none", helper: "Sudah termasuk nasi & sayur." },
  { id: "kentang-goreng", category: "Snacks", name: "Kentang", basePrice: 15000, choiceMode: "none" },
  { id: "pisang-goreng", category: "Snacks", name: "Pisang", basePrice: 15000, choiceMode: "none" },
  { id: "tahu-tempe-goreng", category: "Snacks", name: "Tahu T", basePrice: 15000, choiceMode: "none" },
  { id: "roti-bakar-coklat-susu", category: "Snacks", name: "Roti CokSu", basePrice: 15000, choiceMode: "none" },
  { id: "roti-bakar-coklat-keju", category: "Snacks", name: "Roti Coke", basePrice: 17000, choiceMode: "none" },
  { id: "nugget", category: "Snacks", name: "Nugget", basePrice: 15000, choiceMode: "none" },
  { id: "telor-setengah-matang", category: "Snacks", name: "Telor 1/2", basePrice: 10000, choiceMode: "none", helper: "1 porsi, 2 butir telur ayam kampung." },
  { id: "teh-manis-panas", category: "Minuman", name: "Teh Manis", basePrice: 5000, choiceMode: "none" },
  { id: "kopi-hitam", category: "Minuman", name: "Kopi Hitam", basePrice: 8000, choiceMode: "none" },
  { id: "teh-telor-susu", category: "Minuman", name: "Teh Telor Susu", basePrice: 12000, choiceMode: "none" },
  { id: "bandrek-susu", category: "Minuman", name: "Bandrek Susu", basePrice: 12000, choiceMode: "none" },
  { id: "teh-susu", category: "Minuman", name: "Teh Susu", basePrice: 8000, choiceMode: "none" },
  { id: "teh-telor", category: "Minuman", name: "Teh Telor", basePrice: 10000, choiceMode: "none" },
  { id: "stmj", category: "Minuman", name: "STMJ", basePrice: 17000, choiceMode: "none" },
  { id: "lemon-tea", category: "Minuman", name: "Lemon Tea", basePrice: 10000, choiceMode: "none" },
  { id: "teh-manis-dingin", category: "Minuman", name: "Es Teh", basePrice: 7000, choiceMode: "none" },
  { id: "teh-anti-masuk-angin", category: "Minuman", name: "Teh AMA", basePrice: 10000, choiceMode: "none" },
  { id: "oase-latte", category: "Minuman", name: "OASE Latte", basePrice: 17000, choiceMode: "none" },
  { id: "spanish-latte", category: "Minuman", name: "Spanish Latte", basePrice: 17000, choiceMode: "none" },
  { id: "matcha-fusion-latte", category: "Minuman", name: "Matcha Fusion Latte", basePrice: 18000, choiceMode: "none" },
  { id: "vanilla-caramel-latte", category: "Minuman", name: "Vanilla Caramel Latte", basePrice: 17000, choiceMode: "none" },
  { id: "coffee-chocolate", category: "Minuman", name: "Coffee Chocolate", basePrice: 17000, choiceMode: "none" },
  { id: "americano", category: "Minuman", name: "Americano", basePrice: 12000, choiceMode: "none" },
  { id: "capuccino", category: "Minuman", name: "Capuccino", basePrice: 15000, choiceMode: "none" },
  { id: "moccacino", category: "Minuman", name: "Moccacino", basePrice: 15000, choiceMode: "none" },
  { id: "latte", category: "Minuman", name: "Latte", basePrice: 15000, choiceMode: "none" },
  { id: "kopi-susu", category: "Minuman", name: "Kopi Susu", basePrice: 10000, choiceMode: "none" },
  { id: "choco-lava", category: "Minuman", name: "Choco Lava", basePrice: 17000, choiceMode: "none" },
  { id: "milo-lava", category: "Minuman", name: "Milo Lava", basePrice: 17000, choiceMode: "none" },
  { id: "taro-lava", category: "Minuman", name: "Taro Lava", basePrice: 16000, choiceMode: "none" },
  { id: "matcha-lava", category: "Minuman", name: "Matcha Lava", basePrice: 18000, choiceMode: "none" }
];
