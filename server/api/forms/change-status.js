import { getServerSession } from '#auth' // импорт функции получения текущей сессии из плагина sidebase-auth
import prisma from '~/server/prisma' // импортируем клиент prisma для запросов в бд

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event); // получаем сессию текущего пользователя

	if( !session || session.role != 'admin' ) return; // если пользователь не авторизован или не админ, выгоняем

	const { form_id, status } = await readBody(event); // загружаем данные из входящего запроса

	let success = false;

	try{
		await prisma.forms.update({ // обновляем статус заявки
			where: {
				id: form_id, // ищем по ID
			},
			data: {
				status,
			},
		});

		success = true;
	}
	catch(e){
		success = false;
	}

	return success;
})