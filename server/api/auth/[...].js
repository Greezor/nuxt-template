import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createHash } from 'crypto'
import prisma from '~/server/prisma'

export default NuxtAuthHandler({
	pages: {
    	signIn: '/login',
  	},
	callbacks: {
		jwt: async ({token, user}) => {
			if( !!user ){
				token.jwt = user?.access_token ?? '';
				token.user = {
					uid: user.id,
					email: user.email,
					role: user.role,
					name: user.name,
					surname: user.surname,
					patronymic: user.patronymic,
					phone: user.phone,
				};
			}

			return Promise.resolve(token);
		},
		session: async ({session, token}) => {
			Object.assign(session, token?.user ?? {});
			return Promise.resolve(session);
		},
	},
	secret: 'very-secret-secret',
    providers: [
        CredentialsProvider.default({
			name: 'Вход',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Пароль', type: 'password' },
			},
			async authorize(credentials, req) {
				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
						password: createHash('sha256')
							.update(credentials.password)
							.digest('hex'),
					},
				});

				if( user )
					return user;
				
				return null;
			}
		}),
    ],
})