// Structured Lapo Oase menu used by the Orders dropdowns.
export type MenuCategory = "Food" | "Beverage" | "Snacks/Bites" | "Kids" | "Paket Combo Nobar";

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

export const menuCategories: MenuCategory[] = ["Food", "Beverage", "Snacks/Bites", "Kids", "Paket Combo Nobar"];

export const menuItems: MenuItemDefinition[] = [
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
          { name: "Sosis", priceDelta: 7000 },
          { name: "Spesial (Babi Goreng & Andaliman)", priceDelta: 20000 }
        ]
      }
    ]
  },
  {
    id: "nasi-goreng",
    category: "Food",
    name: "Nasi Goreng",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "Original", price: 15000 },
      { name: "Telur", price: 18000 },
      { name: "Kornet", price: 22000 },
      { name: "Sosis", price: 22000 },
      { name: "Spesial (Babi Goreng & Andaliman)", price: 35000 }
    ]
  },
  { id: "tuak", category: "Beverage", name: "Tuak", basePrice: 5000, choiceMode: "none" },
  {
    id: "bandrek",
    category: "Beverage",
    name: "Bandrek",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "Original", price: 12000 },
      { name: "Susu", price: 15000 }
    ]
  },
  { id: "teh-telur", category: "Beverage", name: "Teh Telur", basePrice: 15000, choiceMode: "none" },
  { id: "stmj", category: "Beverage", name: "STMJ", basePrice: 20000, choiceMode: "none" },
  {
    id: "teh",
    category: "Beverage",
    name: "Teh Manis",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "Panas", price: 7000 },
      { name: "Es Teh Manis", price: 10000 }
    ]
  },
  {
    id: "kopi",
    category: "Beverage",
    name: "Kopi",
    basePrice: 0,
    choiceMode: "single",
    choices: [
      { name: "Tubruk", price: 12000 },
      { name: "Cappucino", price: 18000 },
      { name: "Gula Aren", price: 25000 },
      { name: "Affogato", price: 18000 },
      { name: "Moccacino", price: 18000 },
      { name: "Matcha Latte", price: 25000 },
      { name: "Vanilla Latte", price: 25000 }
    ]
  },
  { id: "dimsum", category: "Snacks/Bites", name: "Dimsum", basePrice: 22000, choiceMode: "none" },
  { id: "siomay", category: "Snacks/Bites", name: "Siomay", basePrice: 22000, choiceMode: "none" },
  {
    id: "kentang-goreng",
    category: "Snacks/Bites",
    name: "Kentang Goreng",
    basePrice: 20000,
    choiceMode: "single",
    choices: [
      { name: "Cheese", priceDelta: 5000 },
      { name: "Sambal teri kacang", priceDelta: 6000 },
      { name: "Bacon + Cheese", priceDelta: 10000 },
      { name: "Bacon + Sambal andaliman", priceDelta: 10000 }
    ]
  },
  {
    id: "ubi-goreng",
    category: "Snacks/Bites",
    name: "Ubi Goreng",
    basePrice: 20000,
    choiceMode: "single",
    choices: [
      { name: "Cheese", priceDelta: 5000 },
      { name: "Sambal teri kacang", priceDelta: 6000 },
      { name: "Bacon + Cheese", priceDelta: 10000 },
      { name: "Bacon + Sambal andaliman", priceDelta: 10000 }
    ]
  },
  { id: "pisang-goreng-gula-aren", category: "Snacks/Bites", name: "Pisang Goreng Gula Aren (4 pcs)", basePrice: 18000, choiceMode: "none" },
  { id: "banana-split", category: "Kids", name: "Banana Split", basePrice: 24000, choiceMode: "none" },
  { id: "nuggets", category: "Kids", name: "Nuggets", basePrice: 26000, choiceMode: "none" },
  { id: "gelato", category: "Kids", name: "Gelato", basePrice: 22000, choiceMode: "none" },
  {
    id: "paket-1-indomie-telor-es-teh",
    category: "Paket Combo Nobar",
    name: "Paket 1 - Indomie Telor + Es Teh",
    basePrice: 28000,
    choiceMode: "none"
  },
  {
    id: "paket-2-pisang-kopi-tubruk",
    category: "Paket Combo Nobar",
    name: "Paket 2 - Pisang Goreng Gula Aren + Kopi Tubruk",
    basePrice: 30000,
    choiceMode: "none"
  },
  {
    id: "paket-3-indomie-telor-bandrek-susu",
    category: "Paket Combo Nobar",
    name: "Paket 3 - Indomie Telor + Bandrek",
    basePrice: 33000,
    choiceMode: "none"
  }
];
