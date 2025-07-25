import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, description, assignedTo, phone, dateArrive } = req.body;

    try {
      const newOrder = await prisma.orders.create({
        data: {
          FullName: title,
          Description: description,
          Phone: parseFloat(phone), // Преобразуем телефон в число
          ArriveDate: dateArrive,
          dateCreated: new Date().toISOString(), // Устанавливаем текущую дату
          Active: 1, // Устанавливаем статус активного заказа
          Done: 0, // Устанавливаем статус завершенного заказа
        },
      });

      res.status(201).json(newOrder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при создании заказа' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Метод ${req.method} не разрешен`);
  }
}
