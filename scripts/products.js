// scripts/products.js — Sunflour Bakery product catalog and rendering
const products = [
  // === BREADS ===
  {
    id: 1,
    title: "Signature Country Loaf",
    category: "breads",
    price: 800,
    image: "assets/images/sourdough_bread.png",
    alt: "Golden country loaf",
    desc: "Hand-shaped sourdough with a golden crust — perfect for breakfast and sandwiches.",
    badge: "Best Seller",
    rating: 4.9,
  },
  {
    id: 2,
    title: "Whole Wheat Bread",
    category: "breads",
    price: 650,
    image: "assets/images/whole_wheat_bread.png",
    alt: "Whole wheat bread loaf",
    desc: "Nutritious whole grain bread, baked fresh daily for a healthy lifestyle.",
    badge: null,
    rating: 4.7,
  },
  {
    id: 3,
    title: "French Baguette",
    category: "breads",
    price: 500,
    image: "assets/images/baguette.png",
    alt: "Crispy French baguette",
    desc: "Classic French-style baguette with a crispy exterior and soft, airy interior.",
    badge: "Popular",
    rating: 4.8,
  },

  // === CAKES ===
  {
    id: 4,
    title: "Decadent Chocolate Cake",
    category: "cakes",
    price: 4500,
    image: "assets/images/chocolate_cake.png",
    alt: "Rich chocolate cake",
    desc: "Three layers of moist chocolate sponge with Belgian chocolate ganache frosting.",
    badge: "Best Seller",
    rating: 4.9,
  },
  {
    id: 5,
    title: "Red Velvet Cake",
    category: "cakes",
    price: 5000,
    image: "assets/images/red_velvet_cake.png",
    alt: "Red velvet cake slice",
    desc: "Stunning red velvet layers with smooth cream cheese frosting.",
    badge: "Popular",
    rating: 4.8,
  },
  {
    id: 6,
    title: "Vanilla Birthday Cake",
    category: "cakes",
    price: 3500,
    image: "assets/images/birthday_cake.png",
    alt: "Vanilla birthday cake with candles",
    desc: "Classic vanilla sponge with buttercream frosting — perfect for celebrations.",
    badge: null,
    rating: 4.7,
  },

  // === PASTRIES ===
  {
    id: 7,
    title: "Buttery Croissant",
    category: "pastries",
    price: 400,
    image: "assets/images/butter_croissant.png",
    alt: "Flaky croissant",
    desc: "Golden, flaky pastry with 27 layers of butter, baked fresh every morning.",
    badge: "Best Seller",
    rating: 4.9,
  },
  {
    id: 8,
    title: "Chocolate Éclair",
    category: "pastries",
    price: 600,
    image: "assets/images/cinnamon_roll.png",
    alt: "Chocolate éclair",
    desc: "Choux pastry filled with vanilla cream and topped with rich chocolate glaze.",
    badge: null,
    rating: 4.6,
  },
  {
    id: 9,
    title: "Danish Pastry",
    category: "pastries",
    price: 500,
    image: "assets/images/danish_pastry.png",
    alt: "Fruit danish pastry",
    desc: "Flaky pastry with sweet cream cheese and seasonal fruit topping.",
    badge: "New",
    rating: 4.5,
  },

  // === FAST FOODS ===
  {
    id: 10,
    title: "Classic Burger",
    category: "fastfoods",
    price: 1500,
    image: "assets/images/beef_burger.png",
    alt: "Juicy beef burger",
    desc: "Homemade beef patty with fresh veggies, cheese, and our signature sauce.",
    badge: "Popular",
    rating: 4.8,
  },
  {
    id: 11,
    title: "Chicken Shawarma",
    category: "fastfoods",
    price: 1200,
    image: "assets/images/chicken_wings.png",
    alt: "Chicken shawarma wrap",
    desc: "Seasoned grilled chicken wrapped with veggies and creamy garlic sauce.",
    badge: "Best Seller",
    rating: 4.9,
  },
  {
    id: 12,
    title: "Meat Pie",
    category: "fastfoods",
    price: 350,
    image: "assets/images/pizza.png",
    alt: "Golden meat pie",
    desc: "Flaky crust filled with seasoned minced beef and vegetables.",
    badge: null,
    rating: 4.6,
  },

  // === DRINKS ===
  {
    id: 13,
    title: "Fresh Fruit Smoothie",
    category: "drinks",
    price: 800,
    image: "assets/images/drinks_category.png",
    alt: "Fresh fruit smoothie",
    desc: "Blended with seasonal fruits, yogurt, and a hint of honey.",
    badge: "Popular",
    rating: 4.7,
  },
  {
    id: 14,
    title: "Iced Latte",
    category: "drinks",
    price: 600,
    image: "assets/images/iced_coffee.png",
    alt: "Iced coffee latte",
    desc: "Smooth espresso with cold milk served over ice — perfect for hot days.",
    badge: null,
    rating: 4.5,
  },
  {
    id: 15,
    title: "Zobo Juice",
    category: "drinks",
    price: 400,
    image: "assets/images/orange_juice.png",
    alt: "Traditional Zobo drink",
    desc: "Traditional Nigerian hibiscus drink, chilled and naturally sweetened.",
    badge: "Local Favorite",
    rating: 4.8,
  },

  // === MORE ===
  {
    id: 16,
    title: "Seasonal Fruit Pie",
    category: "more",
    price: 2000,
    image: "assets/images/more_category.png",
    alt: "Fruit pie with lattice crust",
    desc: "Seasonal fruit pie with a beautiful lattice crust, served warm.",
    badge: null,
    rating: 4.6,
  },
  {
    id: 17,
    title: "Cupcake Box (6 pcs)",
    category: "more",
    price: 3000,
    image: "assets/images/more_category.png",
    alt: "Assorted cupcakes",
    desc: "Assorted flavors: vanilla, chocolate, red velvet, and more — perfect for parties.",
    badge: "Great for Gifts",
    rating: 4.9,
  },
  {
    id: 18,
    title: "Chin Chin (500g)",
    category: "more",
    price: 800,
    image: "assets/images/pastries_category.png",
    alt: "Nigerian chin chin snack",
    desc: "Crunchy Nigerian snack made fresh — great for snacking anytime.",
    badge: "Local Favorite",
    rating: 4.7,
  },
];

// Badge color mapping
const badgeColors = {
  "Best Seller": { bg: "#22c55e", color: "#fff" },
  Popular: { bg: "#f59e0b", color: "#fff" },
  New: { bg: "#3b82f6", color: "#fff" },
  "Local Favorite": { bg: "#e34a3b", color: "#fff" },
  "Great for Gifts": { bg: "#8b5cf6", color: "#fff" },
};

// Category label mapping
const categoryLabels = {
  breads: "Breads",
  cakes: "Cakes",
  pastries: "Pastries",
  fastfoods: "Fast Foods",
  drinks: "Drinks",
  more: "More",
};

// Star rating helper
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("data-category", product.category);
    card.setAttribute("role", "group");
    card.setAttribute("aria-labelledby", `product-title-${product.id}`);
    card.setAttribute(
      "aria-describedby",
      `product-desc-${product.id} product-price-${product.id}`
    );

    const badgeHTML = product.badge
      ? `<span class="product-badge" style="background:${
          badgeColors[product.badge]?.bg || "#e34a3b"
        };color:${badgeColors[product.badge]?.color || "#fff"}">${
          product.badge
        }</span>`
      : "";

    const categoryLabel = categoryLabels[product.category] || "Menu";
    card.innerHTML = `
      <div class="product-image-wrapper">
        ${badgeHTML}
        <img class="product-image" src="${product.image}" alt="${
      product.alt
    }" loading="lazy">
      </div>
      <div class="product-body">
        <h3 class="product-title" id="product-title-${product.id}">${
      product.title
    }</h3>
        <div class="product-meta">
          <span class="product-rating" aria-label="Rating ${
            product.rating
          } out of 5">${renderStars(product.rating)} <small>${
      product.rating
    }</small></span>
          <span class="product-price" id="product-price-${
            product.id
          }">₦${product.price.toLocaleString()}</span>
        </div>
        <p class="product-tags">Category: ${categoryLabel}</p>
        <p class="product-desc" id="product-desc-${product.id}">${
      product.desc
    }</p>
        <div class="product-actions" role="group" aria-label="Actions for ${
          product.title
        }">
          <button type="button" class="btn btn-small btn-primary" data-action="order" data-id="${
            product.id
          }" aria-label="Add ${product.title} to cart">Add to Cart</button>
          <button type="button" class="btn btn-ghost btn-small" data-action="quickview" aria-label="View details for ${
            product.title
          }">View Details</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Order handling is delegated globally in main.js to keep behavior consistent across static and dynamic cards.
});
