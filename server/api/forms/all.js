import { getServerSession } from '#auth' // импорт функции получения текущей сессии из плагина sidebase-auth
import prisma from '~/server/prisma' // импортируем клиент prisma для запросов в бд

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event); // получаем сессию текущего пользователя

	if( !session || session.role != 'admin' ) return; // если пользователь не авторизован или не админ, выгоняем

	const forms = await prisma.forms.findMany(); // загрузить все заявки

	return forms;
})