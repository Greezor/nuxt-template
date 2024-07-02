import { getServerSession } from '#auth' // импорт функции получения текущей сессии из плагина sidebase-auth
import prisma from '~/server/prisma' // импортируем клиент prisma для запросов в бд

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event); // получаем сессию текущего пользователя

	if( !session ) return; // если пользователь не авторизован, выгоняем

	const { form } = await readBody(event); // загружаем данные формы из входящего запроса

	const newForm = await prisma.forms.create({ // создаём новую заявку
		data: {
			...form, // все данные формы
			user_id: session.uid, // привязываем к текущему пользователю
			status: 'на проверке', // статус по умолчанию
		},
	});

	return !!newForm; // если заявка создана, отправляем true
})