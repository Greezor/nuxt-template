<template>
	Личный кабинет

	<hr>

	<table border>
		<tr v-for="(value, prop) in user">
			<td>{{ prop }}</td>
			<td>{{ value }}</td>
		</tr>
	</table>

	<hr>

	Создать заявку:
	
	<form @submit.prevent="createForm">
		<div>
			<label>
				<div>Заголовок</div>
				<input type="text" v-model="create_form.title" required>
			</label>
		</div>

		<div>
			<label>
				<div>Описание</div>
				<textarea v-model="create_form.desc" required></textarea>
			</label>
		</div>

		<div>
			<button>
				{{ wait ? '...' : 'Отправить' }}
			</button>
		</div>
	</form>

	<hr>

	<table border>
		<tr>
			<th>ID</th>
			<th>Заголовок</th>
			<th>Описание</th>
			<th>Статус</th>
		</tr>

		<tr v-for="form in forms">
			<td>{{ form.id }}</td>
			<td>{{ form.title }}</td>
			<td>{{ form.desc }}</td>
			<td>{{ form.status }}</td>
		</tr>
	</table>
</template>

<script>
	export default defineNuxtComponent({
		async setup()
		{
			definePageMeta({
				middleware: 'auth', // Пускать только авторизованных пользователей
			});

			const { getSession } = useAuth(); // импорт функции получения сессии из плагина sidebase-auth
			const session = await getSession(); // получаем данные текущего пользователя из сессии

			return {
				session,
			}
		},
		data()
		{
			return {
				forms: [],

				create_form: {
					title: '',
					desc: '',
				},

				wait: false,
			};
		},
		computed: {
			user()
			{
				const { email, name, surname, patronymic, phone } = this.session; // берём из сессии только нужные поля
				return { email, name, surname, patronymic, phone };
			},
		},
		methods: {
			async loadForms()
			{
				this.forms = await $fetch('/api/forms'); // запрос на загрузку наших заявок
			},

			async createForm()
			{
				const success = await $fetch('/api/forms/create', { // запрос на создание заявки
					method: 'POST',
					body: {
						form: this.create_form,
					},
				});

				if( success )
					this.loadForms();
				else
					alert('Ошибка!');
			},
		},
		mounted()
		{
			this.loadForms(); // загружаем формы при загрузке страницы
		},
	})
</script>