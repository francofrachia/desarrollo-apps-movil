export const COLOR_HEX = {
  Blue:  '#4A90D9',
  White: '#F0F0F0',
  Pink:  '#FF9BAE',
  Black: '#2C2C2C',
  Red:   '#E23B3B',
};

export const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'NikeCourt Lite 2',
    subtitle: "Women's Hard Court Tennis Shoe",
    price: 67.00,
    originalPrice: null,
    image: require('../../assets/nike_court_lite.jpg'),
    colors: ['Blue', 'White', 'Pink', 'Black'],
    sizes: ['36EU', '37EU', '38EU', '39EU', '40EU'],
    selectedColor: 'Blue',
    selectedSize: '38EU',
    qty: 1,
  },
  {
    id: '2',
    name: 'Wilson Hammer 5.3',
    subtitle: 'Adult Tennis Racket',
    price: 80.45,
    originalPrice: 90.05,
    image: require('../../assets/wilson_hammer.jpg'),
    colors: ['Black', 'Red', 'Blue'],
    sizes: ['2-1/4', '2-3/8', '2-1/2'],
    selectedColor: 'Black',
    selectedSize: '2-1/4',
    qty: 1,
  },
];
