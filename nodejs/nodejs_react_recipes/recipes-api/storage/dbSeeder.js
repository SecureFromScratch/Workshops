import Recipe from '../models/recipeModel.js';
import RegisteredUser from '../models/registeredUserModel.js';

const defaultRegisteredUsers = [
  { username: '~~~InternalNetwork', isSubscribed: true },
  { username: 'Avi' },
  { username: 'Eitan' },
  { username: 'Noam', isSubscribed: true },
  { username: 'Tamar' },
  { username: 'Shira', isSubscribed: true },
  { username: 'Yael' },
];

const defaultRecipes = [
  {
    id: '98e4e19a-9b48-4b2b-bf08-2fe272d3c6a9',
    name: 'Chocolate Cake',
    instructions: `<ol>
        <li>Preheat oven to 350°F (177°C).</li>
        <li>In a large mixing bowl, combine flour, sugar, cocoa powder, baking soda, and salt.</li>
        <li>Add eggs, milk, oil, and vanilla extract; mix until smooth.</li>
        <li>Pour batter into a greased baking pan.</li>
        <li>Bake for 30-35 minutes or until a toothpick inserted in the center comes out clean.</li>
        <li>Let it cool before frosting or serving.</li>
        </ol>`,
    imagePath: 'chocolate-cake.png',
    taggedBy: {
      Eitan: {
        cake: { direction: 1, atLocalTime: '2024/11/01 12:03:56' }, 
        frosting: { direction: 1, atLocalTime: '2024/11/03 10:52:56' },
      },
      Avi: { 
        cake: { direction: 1, atLocalTime: '2024/12/01 14:13:16' }, 
        chocolate: { direction: 1, atLocalTime: '2024/12/01 14:13:16' }, 
      },
      Shira: { 
        cake: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        frosting: { direction: 1, atLocalTime: '2024/11/13 00:00:12' }
      },
      Yael: { 
        cake: { direction: 1, atLocalTime: '2024/11/02 02:55:00' },
        festive: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        decorative: { direction: 1, atLocalTime: '2024/11/02 02:55:00' },
      },
      Tamar: { 
        frosting: { direction: 1, atLocalTime: '2024/10/29 13:02:45' }
      },
      Noam: { 
        frosting: { direction: -1, atLocalTime: '2024/12/01 08:00:02' }
      },
    },
  },
  {
    id: '054b7210-17cf-4efa-a287-b9925b554d44',
    name: 'Orange Cake',
    instructions: `<ol>
        <li>Preheat oven to 350°F (177°C).</li>
        <li>Combine flour, sugar, baking powder, and salt in a mixing bowl.</li>
        <li>In a separate bowl, mix eggs, orange juice, oil, and zest from one orange.</li>
        <li>Add wet ingredients to dry ingredients and stir until combined.</li>
        <li>Pour into a greased baking pan.</li>
        <li>Bake for 25-30 minutes, or until golden and set.</li>
        <li>Let cool before serving.</li>
        </ol>`,
    imagePath: 'orange-cake.png',
    taggedBy: { 
      Eitan: {
        cake: { direction: 1, atLocalTime: '2024/11/01 12:03:56' }, 
        orange: { direction: 1, atLocalTime: '2024/11/01 12:03:56' }, 
        healthy: { direction: -1, atLocalTime: '2024/10/29 13:02:45' },
      },
      Avi: { 
        cake: { direction: 1, atLocalTime: '2024/12/01 14:13:16' }, 
        orange: { direction: 1, atLocalTime: '2024/12/01 14:13:16' }, 
        healthy: { direction: -1, atLocalTime: '2024/10/29 13:02:45' },
      },
      Shira: { 
        cake: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        orange: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        healthy: { direction: 1, atLocalTime: '2024/11/13 00:00:12' },
      },
      Yael: { 
        cake: { direction: -1, atLocalTime: '2024/11/02 02:55:00' }, 
        orange: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        healthy: { direction: 1, atLocalTime: '2024/10/29 13:02:45' },
      },
      Tamar: { 
        cake: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        orange: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        healthy: { direction: 1, atLocalTime: '2024/10/29 13:02:45' },
      },
      Noam: { 
        cake: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        orange: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
      },
    },
  },
  {
    id: 'dfe70131-2f99-43f9-be26-1c2bd674d033',
    name: 'Carrot Cake',
    instructions: `<ol>
        <li>Preheat oven to 350°F (177°C).</li>
        <li>Mix flour, sugar, baking powder, baking soda, and cinnamon in a bowl.</li>
        <li>In a separate bowl, combine eggs, oil, and vanilla extract.</li>
        <li>Stir in grated carrots and crushed pineapple.</li>
        <li>Combine wet and dry ingredients, then pour into a greased baking pan.</li>
        <li>Bake for 35-40 minutes, or until a toothpick comes out clean.</li>
        <li>Cool and top with cream cheese frosting.</li>
        </ol>`,
    imagePath: 'carrot-cake.png',
    taggedBy: { 
      Eitan: {
        cake: { direction: 1, atLocalTime: '2024/11/01 12:03:56' }, 
        orange: { direction: 1, atLocalTime: '2024/11/01 12:03:56' }, 
        healthy: { direction: -1, atLocalTime: '2024/10/29 13:02:45' },
      },
      Avi: { 
        cake: { direction: 1, atLocalTime: '2024/12/01 14:13:16' }, 
        carrot: { direction: 1, atLocalTime: '2024/12/01 14:13:16' }, 
      },
      Shira: { 
        cake: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        carrot: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        healthy: { direction: 1, atLocalTime: '2024/11/13 00:00:12' },
      },
      Yael: { 
        cake: { direction: -1, atLocalTime: '2024/11/02 02:55:00' }, 
        orange: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
      },
      Tamar: { 
        cake: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        carrot: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        healthy: { direction: 1, atLocalTime: '2024/10/29 13:02:45' },
      },
      Noam: { 
        cake: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        carrot: { direction: 1, atLocalTime: '2024/11/02 02:55:00' }, 
        healthy: { direction: 1, atLocalTime: '2024/10/29 13:02:45' },
      },
    },
    isPremium: true,
  },
];

export default async function seedInitialDbValues() {
  await seedDefaultUsers();
  await seedDefaultRecipes();
}

async function seedDefaultUsers() {
  try {
    const usersCount = await RegisteredUser.countDocuments();
    if (usersCount === 0) {
      await RegisteredUser.insertMany(defaultRegisteredUsers);
      console.log('Default users inserted successfully.');
    } else {
      console.log('Users collection is not empty. Skipping seeding.');
    }
  } catch (error) {
    console.error('Error inserting default users:', error);
  }
};

async function seedDefaultRecipes() {
  try {
    const recipeCount = await Recipe.countDocuments();
    if (recipeCount === 0) {
      await Recipe.insertMany(defaultRecipes);
      console.log('Default recipes inserted successfully.');
    } else {
      console.log('Recipes collection is not empty. Skipping seeding.');
    }
  } catch (error) {
    console.error('Error inserting default recipes:', error);
  }
};

//module.exports = seedDefaultRecipes;
