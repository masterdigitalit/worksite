// import { PrismaClient, OrderStatus, VisitType, CheckType } from "@prisma/client";
// const prisma = new PrismaClient();

// const statuses = Object.values(OrderStatus);
// const visitTypes = Object.values(VisitType);
// const checkTypes = Object.values(CheckType);
// const cities = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск"];
// const campaigns = ["Instagram", "Google Ads", "Сарафан"];
// const equipmentTypes = ["Холодильник", "Стиральная машина", "Посудомойка", "Плита"];

// async function main() {
//   let count = 1;

//   for (const status of statuses) {
//     for (const visitType of visitTypes) {
//       for (const checkType of checkTypes) {
//         const order = await prisma.order.create({
//           data: {
//             fullName: `Клиент #${count}`,
//             phone: `+79${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`,
//             address: `Улица Примерная, д. ${count}`,
//             problem: `Проблема с оборудованием #${count}`,
//             arriveDate: new Date(Date.now() + 1000 * 60 * 60 * (count % 48)), // от текущего момента
//             visitType,
//             callRequired: Math.random() > 0.5,
//             isProfessional: Math.random() > 0.5,
//             city: cities[count % cities.length],
//             clientPrice: 1000 + count * 100,
//             campaign: campaigns[count % campaigns.length],
//             equipmentType: equipmentTypes[count % equipmentTypes.length],
//             status,
//             checkType,
//             workerPrice: 500 + (count % 5) * 100,
//             pureCheck: 300 + (count % 7) * 50,
//             cashToReturn: 100 * (count % 3),
//             paymentReceived: 1000 + (count % 5) * 200,
//             branchComment: `Комментарий от филиала #${count}`,
//             callCenterNote: `Комментарий от колл-центра #${count}`,
//           },
//         });

//         console.log(`Создан заказ #${order.id} (${status} / ${visitType} / ${checkType})`);
//         count++;
//       }
//     }
//   }
// }

// main()
//   .then(() => {
//     console.log("✅ Все заказы созданы");
//     return prisma.$disconnect();
//   })
//   .catch((e) => {
//     console.error("❌ Ошибка при создании заказов:", e);
//     return prisma.$disconnect();
//   });



















// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// const generateWorkers = () => {
//   const fullNames = [
//     "Алексей Смирнов", "Мария Иванова", "Игорь Козлов", "Светлана Петрова",
//     "Дмитрий Васильев", "Елена Кузнецова", "Андрей Морозов", "Ольга Никитина",
//     "Николай Фёдоров", "Анна Михайлова", "Павел Волков", "Екатерина Павлова",
//     "Виктор Соколов", "Алина Тарасова", "Роман Орлов", "Юлия Баранова",
//     "Максим Григорьев", "Дарья Попова", "Сергей Романов", "Инна Беляева",
//     "Артем Захаров", "Валерия Чернова", "Евгений Лебедев", "Кристина Сидорова",
//     "Владимир Антонов", "Татьяна Егорова", "Георгий Дмитриев", "Маргарита Ковалева",
//     "Станислав Киселёв", "Вероника Карпова", "Олег Назаров", "Людмила Соловьёва",
//     "Илья Андреев", "Алёна Суханова", "Руслан Алексеев", "Вера Зайцева",
//     "Константин Богданов", "Полина Лукина", "Анатолий Савельев", "Жанна Тихонова",
//     "Василий Шестаков", "Ксения Голубева", "Борис Ефимов", "Надежда Панина",
//     "Григорий Никифоров", "Нина Щербакова", "Владислав Устинов", "Оксана Гаврилова",
//     "Артур Ермаков", "Яна Борисова",
//   ];

//   return fullNames.map((name, index) => ({
//     fullName: name,
//     telegramUsername: index % 4 === 0 ? null : `user${index + 1}`,
//     phone: `+7 9${Math.floor(Math.random() * 1000)
//       .toString()
//       .padStart(3, "0")}-${Math.floor(Math.random() * 10000)
//       .toString()
//       .padStart(4, "0")}`,
//   }));
// };


// async function seedWorkers() {
//   const workers = generateWorkers();

//   await prisma.worker.createMany({
//   data: workers
// });

//   console.log(`${workers.length} сотрудников добавлено`);
// }

// seedWorkers()
//   .then(() => process.exit(0))
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   });



















// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// function getRandomInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// async function updateDoneOrders() {
//   try {
//     const doneOrders = await prisma.order.findMany({
//       where: { status: "DONE" },
//       select: { id: true },
//     });

//     let updatedCount = 0;
//     const now = new Date();

//     for (const order of doneOrders) {
//       const received = getRandomInt(1000, 10000);
//       const outlay = getRandomInt(0, received);
//       const receivedworker = Math.max(0, Math.floor(received / 2) - outlay);

//       await prisma.order.update({
//         where: { id: order.id },
//         data: {
//           received,
//           outlay,
//           receivedworker,
//           dateStarted: now,
//           dateDone: now,
//         },
//       });

//       updatedCount++;
//     }

//     console.log(`Обновлено заказов: ${updatedCount}`);
//   } catch (error) {
//     console.error("Ошибка при обновлении заказов:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// updateDoneOrders();




// scripts/seedDocuments.ts
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function addDocumentToOrder(orderId) {
  const filename = `${uuidv4()}.png`;
  const url = `/uploads/${filename}`; // без /public

  const document = await prisma.orderDocument.create({
    data: {
      orderId,
      type: "PNG", // замените на нужный enum, если используется
      url,
    },
  });

  console.log("Документ добавлен:", document);
}

async function run() {
  await addDocumentToOrder(2); // первый файл

}

run()
  .then(() => {
    console.log("Готово ✅");
  })
  .catch((error) => {
    console.error("Ошибка ❌", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
