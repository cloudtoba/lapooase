// Structured Lapo Oase menu used by the Orders dropdowns.
export type MenuCategory = "Food" | "Beverage" | "Snacks/Bites" | "Kids";

export type ChoiceMode = "none" | "single" | "multi";

export type MenuChoice = {
  name: string;
  priceDelta?: number;
};

export type MenuItemDefinition = {
  id: string;
  category: MenuCategory;
  name: string;
  basePrice: number;
  choiceMode: ChoiceMode;
  choices?: MenuChoice[];
  helper?: string;
  temperatureOptions?: MenuChoice[];
};

export const menuCategories: MenuCategory[] = ["Food", "Beverage", "Snacks/Bites", "Kids"];

export const menuItems: MenuItemDefinition[] = [
  {
    id: "kari",
    category: "Food",
    name: "Kari",
    basePrice: 35000,
    choiceMode: "multi",
    helper: "Choose one or more bases, or apply all.",
    choices: [{ name: "Nasi" }, { name: "Bubur" }, { name: "Mie Gomak" }, { name: "Bihun" }]
  },
  {
    id: "sup",
    category: "Food",
    name: "Sup",
    basePrice: 32000,
    choiceMode: "multi",
    helper: "Choose one or more bases, or apply all.",
    choices: [{ name: "Nasi" }, { name: "Bubur" }, { name: "Mie Gomak" }, { name: "Bihun" }]
  },
  {
    id: "ngarok-siak-tolu",
    category: "Food",
    name: "Ngarok Siak Tolu",
    basePrice: 48000,
    choiceMode: "single",
    helper: "Pick only one protein.",
    choices: [{ name: "Babi" }, { name: "Ikan Mujahir" }, { name: "Ayam" }]
  },
  {
    id: "goreng-xo",
    category: "Food",
    name: "Goreng XO",
    basePrice: 38000,
    choiceMode: "single",
    choices: [{ name: "Nasi" }, { name: "Mie Gomak Lidi" }, { name: "Bihun" }, { name: "Ifumie" }, { name: "Kwetiaw" }]
  },
  {
    id: "goreng-kampung",
    category: "Food",
    name: "Goreng Kampung",
    basePrice: 36000,
    choiceMode: "single",
    choices: [{ name: "Nasi" }, { name: "Mie Gomak Lidi" }, { name: "Bihun" }, { name: "Ifumie" }, { name: "Kwetiaw" }]
  },
  {
    id: "goreng-andaliman",
    category: "Food",
    name: "Goreng Andaliman",
    basePrice: 39000,
    choiceMode: "single",
    choices: [{ name: "Nasi" }, { name: "Mie Gomak Lidi" }, { name: "Bihun" }, { name: "Ifumie" }, { name: "Kwetiaw" }]
  },
  { id: "tuak", category: "Beverage", name: "Tuak", basePrice: 18000, choiceMode: "none" },
  { id: "bandrek", category: "Beverage", name: "Bandrek", basePrice: 18000, choiceMode: "none" },
  {
    id: "teh",
    category: "Beverage",
    name: "Teh",
    basePrice: 16000,
    choiceMode: "single",
    choices: [{ name: "Camomile" }, { name: "Melati" }, { name: "Oolong" }],
    temperatureOptions: [{ name: "Panas" }, { name: "Dingin", priceDelta: 2000 }]
  },
  {
    id: "kopi",
    category: "Beverage",
    name: "Kopi",
    basePrice: 25000,
    choiceMode: "single",
    choices: [{ name: "Cappucino" }, { name: "Moccacino" }, { name: "Gula Aren" }, { name: "Matcha Latte" }, { name: "Affogato" }],
    temperatureOptions: [{ name: "Panas" }, { name: "Dingin", priceDelta: 2000 }]
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
  { id: "pisang-goreng-gula-aren", category: "Snacks/Bites", name: "Pisang Goreng Gula Aren", basePrice: 22000, choiceMode: "none" },
  { id: "banana-split", category: "Kids", name: "Banana Split", basePrice: 24000, choiceMode: "none" },
  { id: "nuggets", category: "Kids", name: "Nuggets", basePrice: 26000, choiceMode: "none" },
  { id: "gelato", category: "Kids", name: "Gelato", basePrice: 22000, choiceMode: "none" }
];
