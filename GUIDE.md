### Инициализация проекта nuxt

- Скачиваем и устанавливаем node.js, если не установлен:
https://nodejs.org/en

- Создаём новый проект командой:
npx nuxi@latest init <my-project>

- Заходим в папку созданного проекта и запускам dev-сервер:
npm run dev

- Проверяем:
http://localhost:3000/

- Пока что выключаем сервер:
Ctrl+C

- Меняем app.vue, чтобы работал роутинг:
```
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

- И создаём `pages/index.vue` для главной страницы:
```
<template>
	Главная
</template>
```

- Создаём `layouts/default.vue` для шаблона страниц по-умолчанию:
```
<template>
	<header></header>

	<main>
		<slot></slot>
	</main>

	<footer></footer>
</template>
```



### Настройка ORM prisma (sqlite)

- Установка пакета prisma:
npm install prisma --save-dev

- Инициализируем prisma в проекте:
npx prisma init --datasource-provider sqlite

- Создаем файл `server/prisma.js` для доступа к клиенту prisma из nuxt:
```
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
```



### Настройка авторизации

- Добавляем модуль sidebase-auth:
npx nuxi@latest module add sidebase-auth

- Также устанавливаем пакет next-auth:
npm i next-auth@4.21.1

- Включаем authjs-провайдер в nuxt.config.ts:
```
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ["@sidebase/nuxt-auth"],
	auth: {
		provider: {
			type: 'authjs',
		},
	},
})
```

- Открываем `prisma/schema.prisma` и добавляем модель для пользователя:
```
model User {
  id    		Int     @id @default(autoincrement())
  email 		String  @unique
  password		String
  role			String
  name			String?
  surname		String?
  patronymic	String?
  phone			String?
}
```

- И создаём миграцию для добавленной модели:
npx prisma migrate dev --name user

- Проверяем созданную таблицу для модели:
npx prisma studio

- Добавляем админа вручную, обязательно с ролью `admin` и паролем `96cae35ce8a9b0244178bf28e4966c2ce1b8385723a96a6b838858cdd6ca0a1e` - это хэш. Пароль у админа будет `123123`.
Можно сгенерить свой хэш. Пишем в терминал `node` и вставляем следующий код:
```
console.log( require('crypto').createHash('sha256').update('<тут пароль>').digest('hex') )
```
На следующей строке будет хэш.

- Завершаем процесс prisma studio:
Ctrl+C

- Создаём файл `server/api/auth/[...].js` и настраиваем авторизацию по логину/паролю:
```
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
```

- Добавляем страницу авторизации, создаём файл `pages/login.vue`:
```
<template>
	<form @submit.prevent="onSubmit">
		<div>
			<label>
				<div>Email</div>
				<input type="email" v-model="form.email" required>
			</label>
		</div>

		<div>
			<label>
				<div>Пароль</div>
				<input type="password" v-model="form.password" required>
			</label>
		</div>

		<div>
			<button>
				{{ wait ? '...' : 'Войти' }}
			</button>
		</div>
	</form>
</template>

<script>
	export default defineNuxtComponent({
		setup()
		{
			const { signIn } = useAuth();

			definePageMeta({
				middleware: 'auth',
				auth: {
					unauthenticatedOnly: true,
        			navigateAuthenticatedTo: '/lk',
				},
			});

			return {
				signIn,
			};
		},
		data()
		{
			return {
				form: {
					email: '',
					password: '',
				},

				wait: false,
			};
		},
		methods: {
			async onSubmit()
			{
				if( this.wait ) return;

				this.wait = true;

				const { error } = await this.signIn('credentials', {
					email: this.form.email,
					password: this.form.password,
					redirect: false,
				});

				if( error )
					alert('Неверный логин или пароль!');
				else
					return navigateTo('/lk');

				this.wait = false;
			},
		},
	})
</script>
```

- Добавляем страницу регистрации, создаём файл `pages/register.vue`:
```
<template>
	<form @submit.prevent="onSubmit">
		<div>
			<label>
				<div>Имя</div>
				<input type="text" v-model="form.name" required>
			</label>
		</div>

		<div>
			<label>
				<div>Фамилия</div>
				<input type="text" v-model="form.surname">
			</label>
		</div>

		<div>
			<label>
				<div>Отчество</div>
				<input type="text" v-model="form.patronymic">
			</label>
		</div>

		<div>
			<label>
				<div>Email</div>
				<input type="email" v-model="form.email" required>
			</label>
		</div>

		<div>
			<label>
				<div>Телефон</div>
				<input type="tel" v-model="form.phone">
			</label>
		</div>

		<div>
			<label>
				<div>Пароль</div>
				<input type="password" v-model="form.password" required>
			</label>
		</div>

		<div>
			<label>
				<div>Повторите пароль</div>
				<input type="password" v-model="form.passwordRepeat" required>
			</label>
		</div>

		<div>
			<button>
				{{ wait ? '...' : 'Зарегистрироваться' }}
			</button>
		</div>
	</form>
</template>

<script>
	export default defineNuxtComponent({
		setup()
		{
			definePageMeta({
				middleware: 'auth',
				auth: {
					unauthenticatedOnly: true,
        			navigateAuthenticatedTo: '/lk',
				},
			});
		},
		data()
		{
			return {
				form: {
					name: '',
					surname: '',
					patronymic: '',
					email: '',
					phone: '',
					password: '',
					passwordRepeat: '',
				},

				wait: false,
			};
		},
		methods: {
			async onSubmit()
			{
				if( this.wait ) return;

				this.wait = true;

				if( this.form.password == this.form.passwordRepeat ){
					const { success, msg } = await $fetch('/api/register', {
						method: 'POST',
						body: {
							form: this.form,
						},
					});

					if( success )
						return navigateTo('/login');
					else
						alert(msg ?? 'Непредвиденная ошибка!');
				}
				else
				{
					alert('Значения в полях "Пароль" и "Повторите пароль" должны совпадать!');
				}

				this.wait = false;
			},
		},
	})
</script>
```

- Для того чтобы регистрация работала нужно добавить метод в api. Создаём файл `server/api/register.js`:
```
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
```

- Создаём страницу личного кабинета `pages/lk.vue`:
```
<template>
	Личный кабинет
</template>

<script>
	export default defineNuxtComponent({
		setup()
		{
			definePageMeta({
				middleware: 'auth',
			});
		},
	})
</script>
```

- И страницу выхода из уч. записи `pages/logout.vue`:
```
<template></template>

<script setup>
	definePageMeta({
		layout: false,
	});

	const { signOut } = useAuth();

	onMounted(async () => {
		await signOut({ redirect: false });
		return navigateTo('/');
	});
</script>
```

- Напоследок, страницу только для админов `pages/admin-panel.vue`:
```
<template>
	Админ панель
</template>

<script>
	export default defineNuxtComponent({
		async setup()
		{
			definePageMeta({
				middleware: 'auth',
			});

			const { getSession } = useAuth();
			const session = await getSession();

			if( session.role != 'admin' )
				return navigateTo('/lk');
		},
	})
</script>
```