import { getServerSession } from '#auth' // импорт функции получения текущей сессии из плагина sidebase-auth
import prisma from '~/server/prisma' // импортируем клиент prisma для запросов в бд

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event); // получаем сессию текущего пользователя

	if( !session ) return; // если пользователь не авторизован, выгоняем

	const forms = await prisma.forms.findMany({ // загрузить все заявки текущего пользователя
		where: {
			user_id: session.uid, // ищем по ID пользователя
		},
	});

	return forms;
})