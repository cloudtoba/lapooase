export type MenuCategory = "Bowls" | "Handhelds" | "Salads" | "Sides" | "Drinks";

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number;
  calories: number;
  image: string;
  tags: string[];
  spiceLevel?: "mild" | "medium" | "hot";
};

export const menuCategories: Array<"All" | MenuCategory> = [
  "All",
  "Bowls",
  "Handhelds",
  "Salads",
  "Sides",
  "Drinks"
];

export const menuItems: MenuItem[] = [
  {
    id: "miso-salmon-bowl",
    name: "Miso Salmon Bowl",
    category: "Bowls",
    description: "Roasted salmon, ginger rice, cucumber, edamame, radish, and sesame miso glaze.",
    price: 17.5,
    calories: 640,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    tags: ["Popular", "Protein"],
    spiceLevel: "mild"
  },
  {
    id: "harissa-chicken-grain-bowl",
    name: "Harissa Chicken Bowl",
    category: "Bowls",
    description: "Charred chicken, ancient grains, citrus slaw, pickled onion, and yogurt herb sauce.",
    price: 15.75,
    calories: 710,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
    tags: ["Chef pick", "Warm"],
    spiceLevel: "medium"
  },
  {
    id: "market-veggie-bowl",
    name: "Market Veggie Bowl",
    category: "Bowls",
    description: "Crisp greens, quinoa, roasted sweet potato, avocado, pepitas, and lemon tahini.",
    price: 13.95,
    calories: 560,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    tags: ["Vegetarian", "Fresh"]
  },
  {
    id: "crispy-chicken-sandwich",
    name: "Crispy Chicken Sandwich",
    category: "Handhelds",
    description: "Buttermilk chicken, chopped lettuce, tomato, bread and butter pickles, and pepper aioli.",
    price: 14.5,
    calories: 820,
    image: "https://images.unsplash.com/photo-1606755962773-d324e2a13086?auto=format&fit=crop&w=900&q=80",
    tags: ["Popular", "Crispy"],
    spiceLevel: "medium"
  },
  {
    id: "smash-burger",
    name: "Double Smash Burger",
    category: "Handhelds",
    description: "Two griddled patties, cheddar, onion jam, shredded lettuce, pickles, and house sauce.",
    price: 16.25,
    calories: 920,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    tags: ["Classic", "Rich"]
  },
  {
    id: "green-goddess-salad",
    name: "Green Goddess Salad",
    category: "Salads",
    description: "Butter lettuce, herbs, snap peas, avocado, toasted seeds, and creamy goddess dressing.",
    price: 12.75,
    calories: 430,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
    tags: ["Vegetarian", "Bright"]
  },
  {
    id: "steak-chimichurri-salad",
    name: "Steak Chimichurri Salad",
    category: "Salads",
    description: "Seared steak, romaine, roasted peppers, fingerling potatoes, and chimichurri vinaigrette.",
    price: 18.95,
    calories: 680,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80",
    tags: ["Protein", "Herby"]
  },
  {
    id: "garlic-fries",
    name: "Garlic Herb Fries",
    category: "Sides",
    description: "Crisp skin-on fries tossed with garlic oil, parsley, parmesan, and smoked sea salt.",
    price: 6.5,
    calories: 510,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
    tags: ["Shareable", "Crispy"]
  },
  {
    id: "tomato-basil-soup",
    name: "Tomato Basil Soup",
    category: "Sides",
    description: "Slow-simmered tomato, roasted garlic, basil oil, and a parmesan crisp.",
    price: 7.25,
    calories: 310,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80",
    tags: ["Cozy", "Vegetarian"]
  },
  {
    id: "citrus-iced-tea",
    name: "Citrus Iced Tea",
    category: "Drinks",
    description: "Black tea, orange peel, lemon, mint, and a light honey finish.",
    price: 4.5,
    calories: 90,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80",
    tags: ["Cold", "House made"]
  },
  {
    id: "sparkling-limeade",
    name: "Sparkling Limeade",
    category: "Drinks",
    description: "Fresh lime, sparkling water, cane sugar, and a salted rim.",
    price: 4.75,
    calories: 120,
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80",
    tags: ["Cold", "Zesty"]
  }
];
