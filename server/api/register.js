import { getServerSession } from '#auth'
import { createHash } from 'crypto'
import prisma from '~/server/prisma'

export default defineEventHandler(async (event) => {
	const session = await getServerSession(event);

	if( session ) return;

	let success = false;
	let msg = '';

	const { form } = await readBody(event);

	try{
		const newUser = await prisma.user.create({
			data: {
				email: form.email,
				password: (
					createHash('sha256')
						.update(form.password)
						.digest('hex')
				),
				role: 'user',
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
		msg = e.message;
	}

	return { success, msg };
  })