import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function seedDatabase() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('Seeding database...');

    // Insert categories
    const categories = [
      { name: 'Tênis', description: 'Sapatos esportivos e casuais' },
      { name: 'Sapato Social', description: 'Sapatos formais e elegantes' },
      { name: 'Bota', description: 'Botas para diversos estilos' },
      { name: 'Mocassim', description: 'Sapatos confortáveis e casuais' },
    ];

    for (const cat of categories) {
      await connection.execute(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [cat.name, cat.description]
      );
    }
    console.log('✓ Categories inserted');

    // Insert sizes
    const sizes = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    for (const size of sizes) {
      await connection.execute(
        'INSERT INTO sizes (size) VALUES (?)',
        [size]
      );
    }
    console.log('✓ Sizes inserted');

    // Insert colors
    const colors = [
      { name: 'Preto', hexCode: '#000000' },
      { name: 'Branco', hexCode: '#FFFFFF' },
      { name: 'Azul', hexCode: '#0066CC' },
      { name: 'Vermelho', hexCode: '#FF0000' },
      { name: 'Marrom', hexCode: '#8B4513' },
      { name: 'Cinza', hexCode: '#808080' },
    ];

    for (const color of colors) {
      await connection.execute(
        'INSERT INTO colors (name, hexCode) VALUES (?, ?)',
        [color.name, color.hexCode]
      );
    }
    console.log('✓ Colors inserted');

    // Insert products
    const products = [
      {
        name: 'Tênis Urban Flex',
        description: 'Tênis esportivo moderno com tecnologia de amortecimento avançada. Perfeito para uso diário e atividades leves.',
        price: '249.90',
        categoryId: 1,
        stock: 32,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
      },
      {
        name: 'Sapato Social Prime',
        description: 'Sapato social elegante em couro genuíno. Ideal para ocasiões formais e ambientes corporativos.',
        price: '329.90',
        categoryId: 2,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'
      },
      {
        name: 'Bota Adventure Pro',
        description: 'Bota resistente com solado antiderrapante. Perfeita para trilhas e atividades outdoor.',
        price: '389.90',
        categoryId: 3,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1543163521-9145f931371e?w=500&h=500&fit=crop'
      },
      {
        name: 'Sneaker Street Run',
        description: 'Sneaker casual com design moderno e confortável. Combina estilo e funcionalidade.',
        price: '219.90',
        categoryId: 1,
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop'
      },
      {
        name: 'Mocassim Clássico Lux',
        description: 'Mocassim de couro premium com acabamento luxuoso. Conforto garantido para o dia todo.',
        price: '279.90',
        categoryId: 4,
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1548062407-f4591d424dec?w=500&h=500&fit=crop'
      },
    ];

    const productIds = [];
    for (const prod of products) {
      const [result] = await connection.execute(
        'INSERT INTO products (name, description, price, categoryId, stock, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
        [prod.name, prod.description, prod.price, prod.categoryId, prod.stock, prod.imageUrl]
      );
      productIds.push(result.insertId);
    }
    console.log('✓ Products inserted');

    // Insert product variations (size and color combinations)
    const sizeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // 34-45
    const colorIds = [1, 2, 3, 4, 5, 6]; // Preto, Branco, Azul, Vermelho, Marrom, Cinza

    for (const productId of productIds) {
      for (const sizeId of sizeIds.slice(0, 6)) { // Use first 6 sizes for each product
        for (const colorId of colorIds.slice(0, 3)) { // Use first 3 colors for each product
          await connection.execute(
            'INSERT INTO productVariations (productId, sizeId, colorId, stock) VALUES (?, ?, ?, ?)',
            [productId, sizeId, colorId, Math.floor(Math.random() * 10) + 5]
          );
        }
      }
    }
    console.log('✓ Product variations inserted');

    console.log('✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
