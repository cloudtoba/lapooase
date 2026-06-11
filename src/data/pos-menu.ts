// Structured Lapo Oase menu used by the Orders dropdowns. Prices are stored in IDR.
export type MenuCategory = "Food" | "Snacks" | "Beverage" | "Paket Nobar";

export type ChoiceMode = "none" | "single" | "multi";

export type MenuChoice = {
  name: string;
  price?: number;
  priceDelta?: number;
};

export type MenuOptionGroup = {
  id: string;
  label: string;
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

export const menuCategories: MenuCategory[] = ["Food", "Snacks", "Beverage", "Paket Nobar"];

export const menuItems: MenuItemDefinition[] = [
  {
    id: "oase-siak-tolu",
    category: "Food",
    name: "OASE SIAK TOLU",
    basePrice: 0,
    choiceMode: "single",
    helper: "Nasi + lauk goreng garing + tiga sambal.",
    choices: [
      { name: "Manuk / Ayam", price: 30000 },
      { name: "Pork Belly / Babi", price: 35000 },
      { name: "Lele", price: 25000 }
    ]
  },
  {
    id: "indomie",
    category: "Food",
    name: "Indomie",
    basePrice: 15000,
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
        required: true,
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
    basePrice: 15000,
    choiceMode: "none",
    optionGroups: [
      {
        id: "topping",
        label: "Topping",
        required: true,
        options: [
          { name: "Polos" },
          { name: "Telur", priceDelta: 5000 },
          { name: "Kornet", priceDelta: 7000 },
          { name: "Sosis", priceDelta: 7000 }
        ]
      }
    ]
  },
  { id: "tambul-babi-goreng-siak-tolu", category: "Snacks", name: "Tambul Pork Belly / Babi Goreng Siak Tolu", basePrice: 45000, choiceMode: "none" },
  {
    id: "dimsum-goreng-serba-29",
    category: "Snacks",
    name: "Dimsum Goreng Serba 29",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "Lumpia Udang", price: 29000 },
      { name: "Bola Udang", price: 29000 },
      { name: "Pangsit Udang", price: 29000 },
      { name: "Kwotie / Gyoza", price: 29000 },
      { name: "Mantao", price: 29000 },
      { name: "Kimis Naga", price: 29000 },
      { name: "Ekado", price: 29000 },
      { name: "Lumpia Keju", price: 29000 }
    ]
  },
  { id: "kentang-goreng", category: "Snacks", name: "Kentang Goreng", basePrice: 20000, choiceMode: "none" },
  { id: "ubi-goreng", category: "Snacks", name: "Ubi Goreng", basePrice: 20000, choiceMode: "none" },
  { id: "pisang-goreng-gula-aren", category: "Snacks", name: "Pisang Goreng Gula Aren", basePrice: 20000, choiceMode: "none" },
  { id: "sosis-nuggets", category: "Snacks", name: "Sosis + Nuggets", basePrice: 20000, choiceMode: "none" },
  { id: "tahu-tempe-goreng", category: "Snacks", name: "Tahu / Tempe Goreng", basePrice: 20000, choiceMode: "none" },
  {
    id: "oase-dimsum-crispy-platter",
    category: "Snacks",
    name: "OASE Dimsum Crispy Platter",
    basePrice: 59000,
    choiceMode: "none",
    helper: "8 pcs mixed signature dimsum + 2 pilihan saus. Harga launching."
  },
  { id: "oase-tuak", category: "Beverage", name: "OASE Tuak", basePrice: 5000, choiceMode: "none" },
  {
    id: "bandrek",
    category: "Beverage",
    name: "Bandrek",
    basePrice: 12000,
    choiceMode: "single",
    choices: [
      { name: "Original", priceDelta: 0 },
      { name: "Susu", priceDelta: 3000 }
    ]
  },
  { id: "teh-telur", category: "Beverage", name: "Teh Telur", basePrice: 15000, choiceMode: "none" },
  { id: "stmj", category: "Beverage", name: "STMJ (Susu Telur Madu Jahe)", basePrice: 20000, choiceMode: "none" },
  { id: "teh-manis-panas", category: "Beverage", name: "Teh Manis Panas", basePrice: 7000, choiceMode: "none" },
  { id: "teh-manis-dingin", category: "Beverage", name: "Teh Manis Dingin", basePrice: 10000, choiceMode: "none" },
  { id: "teh-anti-masuk-angin", category: "Beverage", name: "Teh Anti Masuk Angin", basePrice: 12000, choiceMode: "none" },
  { id: "oase-latte", category: "Beverage", name: "OASE Latte", basePrice: 19000, choiceMode: "none" },
  {
    id: "kopi",
    category: "Beverage",
    name: "Kopi",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "Kopi Tubruk", price: 12000 },
      { name: "Black Coffee", price: 10000 },
      { name: "Americano", price: 12000 },
      { name: "Cappuccino", price: 17000 },
      { name: "Mochaccino", price: 18000 },
      { name: "Latte", price: 16000 }
    ]
  },
  { id: "choco-lava", category: "Beverage", name: "Choco Lava", basePrice: 17000, choiceMode: "none" },
  { id: "milo-lava", category: "Beverage", name: "Milo Lava", basePrice: 17000, choiceMode: "none" },
  { id: "taro-lava", category: "Beverage", name: "Taro Lava", basePrice: 16000, choiceMode: "none" },
  { id: "matcha-lava", category: "Beverage", name: "Matcha Lava", basePrice: 18000, choiceMode: "none" },
  {
    id: "paket-tabo",
    category: "Paket Nobar",
    name: "Paket Tabo - Dimsum Goreng + Kopi Tubruk",
    basePrice: 39000,
    choiceMode: "none"
  },
  {
    id: "paket-sarbas",
    category: "Paket Nobar",
    name: "Paket Sarbas - OASE Siak Tolu Babi + Teh Anti Masuk Angin",
    basePrice: 45000,
    choiceMode: "none"
  },
  {
    id: "paket-mdk",
    category: "Paket Nobar",
    name: "Paket MDK - Tambul Babi Goreng Siak Tolu + 2 Gelas Tuak",
    basePrice: 50000,
    choiceMode: "none"
  },
  {
    id: "paket-mamora",
    category: "Paket Nobar",
    name: "Paket Mamora - Indomie + Telur + Teh Manis Panas",
    basePrice: 25000,
    choiceMode: "none"
  }
];
