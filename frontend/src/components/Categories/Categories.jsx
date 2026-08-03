import React, { useState } from 'react';
import './Categories.css';

export default function Categories() {
  const categories = [
    {
      id: 'grains',
      name: 'Grains',
      desc: 'Rice, Wheat, Corn and more',
      icon: <img src="/src/assets/icons/wheat.png" alt="Grains" className="w-6 h-6 object-contain" />,
      count: '142 Products'
    },
    {
      id: 'fruits',
      name: 'Fruits & Vegetables',
      desc: 'Fresh fruits and vegetables',
      icon: <img src="/src/assets/icons/grapes.png" alt="Fruits" className="w-6 h-6 object-contain" />,
      count: '320 Products'
    },
    {
      id: 'dairy',
      name: 'Dairy Products',
      desc: 'Milk, Paneer and other dairy products',
      icon: <img src="/src/assets/icons/milk-bottle.png" alt="Dairy" className="w-6 h-6 object-contain" />,
      count: '84 Products'
    },
    {
      id: 'spices',
      name: 'Spices',
      desc: 'Fresh herbs and spices',
      icon: <img src="/src/assets/icons/chili-pepper.png" alt="Spices" className="w-6 h-6 object-contain" />,
      count: '67 Products'
    }
  ];

  const featuredProducts = {
    grains: [
      {
        name: 'Nellore Sona Masuri Rice',
        price: '₹65 / Kg',
        stock: '2,500 Kg',
        farm: 'Krishna Delta Farm',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Premium Wheat',
        price: '₹40 / Kg',
        stock: '5,000 Kg',
        farm: 'Godavari Plains Farm',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Organic Finger Millet (Ragi)',
        price: '₹55 / Kg',
        stock: '1,500 Kg',
        farm: 'Rayalaseema Organic Farms',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600'
      }
    ],
    fruits: [
      {
        name: 'Guntur Red Tomatoes',
        price: '₹35 / Kg',
        stock: '400 Kg',
        farm: 'Madanapalle Farms',
        image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Banginapalli Mangoes',
        price: '₹120 / Kg',
        stock: '800 Kg',
        farm: 'Chittoor Groves',
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Kashmiri Red Apples',
        price: '₹160 / Kg',
        stock: '600 Kg',
        farm: 'Srinagar Orchards',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=600'
      }
    ],
    dairy: [
      {
        name: 'Fresh Buffalo Milk',
        price: '₹70 / Litre',
        stock: '150 Litres',
        farm: 'Guntur Dairy Cooperative',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Fresh Paneer',
        price: '₹320 / Kg',
        stock: '60 Kg',
        farm: 'Krishna Dairy Cooperative',
        image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Organic Cow Ghee',
        price: '₹650 / Litre',
        stock: '200 Litres',
        farm: 'Vrindavan Dairy Farms',
        image: '/cow-ghee.png'
      }
    ],
    spices: [
      {
        name: 'Kadapa Turmeric Root',
        price: '₹150 / Kg',
        stock: '120 Kg',
        farm: 'Rayalaseema Farms',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Guntur Red Chillies',
        price: '₹180 / Kg',
        stock: '1,200 Kg',
        farm: 'Andhra Spice Farms',
        image: 'https://images.unsplash.com/photo-1546860255-95536c19724e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVkJTIwY2hpbGxpfGVufDB8fDB8fHww'
      },
      {
        name: 'Malabar Black Pepper',
        price: '₹450 / Kg',
        stock: '350 Kg',
        farm: 'Malabar Hills Spices',
        image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600'
      }
    ]
  };

  const [activeCategory, setActiveCategory] = useState('grains');

  return (
    <section id="categories" className="categories-section">
      <div className="categories-container">

        {/* Header */}
        <div className="categories-header">
          <span className="categories-badge">
            Categories
          </span>
          <h2 className="categories-title">
            Browse Categories
          </h2>
          <p className="categories-desc">
            Choose from a wide range of farm products.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="categories-tabs">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-tab ${isActive ? 'category-tab-active' : 'category-tab-inactive'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className={`category-tab-icon ${isActive ? 'category-tab-icon-active' : 'category-tab-icon-inactive'}`}>
                  {cat.icon}
                </span>
                <div className="flex flex-col text-left">
                  <span className={`category-tab-name ${isActive ? 'category-tab-name-active' : 'category-tab-name-inactive'}`}>
                    {cat.name}
                  </span>
                  <span className={`category-tab-desc ${isActive ? 'category-tab-desc-active' : 'category-tab-desc-inactive'}`}>
                    {cat.desc}
                  </span>
                  <span className={`category-tab-count ${isActive ? 'category-tab-count-active' : 'category-tab-count-inactive'}`}>
                    {cat.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Display Products of Active Category */}
        <div className="products-grid-wrapper">
          <div className="products-grid">
            {featuredProducts[activeCategory].map((prod, idx) => (
              <div key={idx} className="product-card">
                <img src={prod.image} alt={prod.name} className="product-card-img" />
                <div className="product-card-tag">
                  Freshly Harvested
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-title">
                    {prod.name}
                  </h3>
                  
                  <div className="mb-3">
                    <span className="text-xs uppercase tracking-wider text-muted font-bold block mb-1">
                      Farm
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {prod.farm}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted font-bold block mb-1">
                        Price
                      </span>
                      <span className="text-lg font-extrabold text-fresh">
                        {prod.price}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted font-bold block mb-1">
                        Available
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {prod.stock}
                      </span>
                    </div>
                  </div>

                  <hr className="product-card-divider" />
                  <button className="btn btn-secondary product-card-btn">
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
