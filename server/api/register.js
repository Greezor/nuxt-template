import { getServerSession } from '#auth' // импорт функции получения текущей сессии из плагина sidebase-auth
import { createHash } from 'crypto' // встроенный пакет node.js для криптографии
import prisma from '~/server/prisma' // импортируем клиент prisma для запросов в бд

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event); // получаем сессию текущего пользователя

	if( session ) return; // если пользователь авторизован, выгоняем

	let success = false; // флаг успеха
	let msg = ''; // сообщение об ошибке

	const { form } = await readBody(event); // загружаем данные формы из входящего запроса

	try{
		const newUser = await prisma.user.create({ // запрос в бд на создание пользователя
			data: {
				email: form.email,
				password: (
					createHash('sha256') // создаём хэш для пароля
						.update(form.password) // сам пароль
						.digest('hex') // строка в шестнадцатеричном виде
				),
				role: 'user', // у всех роль "просто пользователь"
				name: form.name,
				surname: form.surname,
				patronymic: form.patronymic,
				phone: form.phone,
			},
		});

		if( newUser )
			success = true;
	}
	catch(e){
		msg = e.message; // ловим сообщение об ошибке
	}

	return { success, msg };
  })