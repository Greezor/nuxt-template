<template>
	<header>
		<h1>Nuxt</h1>

		<nav>
			<NuxtLink class="nav-btn" to="/">Главная</NuxtLink>
			
			<template v-if="status == 'authenticated'">
				<NuxtLink class="nav-btn" to="/lk">Личный кабинет</NuxtLink>
				<NuxtLink v-if="session.role == 'admin'" class="nav-btn" to="/admin-panel">Админка</NuxtLink>
				<NuxtLink class="nav-btn" to="/logout">Выйти</NuxtLink>
			</template>

			<template v-else>
				<NuxtLink class="nav-btn" to="/login">Вход</NuxtLink>
				<NuxtLink class="nav-btn" to="/register">Регистрация</NuxtLink>
			</template>
		</nav>
	</header>

	<main>
		<slot></slot>
	</main>

	<footer>{{ new Date().getFullYear() }} ©</footer>
</template>

<script>
	export default defineNuxtComponent({
		async setup()
		{
			const { status, getSession } = useAuth(); // импорт функции получения сессии из плагина sidebase-auth
			const session = await getSession(); // получаем данные текущего пользователя из сессии

			return {
				status,
				session,
			}
		},
	})
</script>

<style>

*{
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: sans-serif;
}

</style>

<style scoped>

header{
	margin-bottom: 10px;
	padding: 10px 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #222;
	color: #fff;
	box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.3);
}

.nav-btn{
	display: inline-block;
	padding: 10px;
	text-decoration: none;
	color: #fff;
	border-bottom: 3px solid transparent;
	transition: all 0.1s ease;
}

.nav-btn:hover{
	border-bottom-color: #17db88;
}

main{
	padding: 10px 20px;
}

footer{
	margin-top: 10px;
	padding: 10px 20px;
	background-color: #777;
	color: #fff;
}

</style>