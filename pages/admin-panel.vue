<template>
	Админ панель

	<hr>

	<table border>
		<tr>
			<th>ID</th>
			<th>Пользователь</th>
			<th>Заголовок</th>
			<th>Описание</th>
			<th>Изображение</th>
			<th>Статус</th>
			<th></th>
			<th></th>
		</tr>

		<tr v-for="form in forms">
			<td>{{ form.id }}</td>
			<td>ID: {{ form.user_id }}</td>
			<td>{{ form.title }}</td>
			<td>{{ form.desc }}</td>
			<td>
				<img
					v-if="form.image"
					:src="form.image"
					width="200">
			</td>
			<td>{{ form.status }}</td>

			<td>
				<button
					@click="setStatus(form.id, 'Принято')"
					type="button">
					Принять
				</button>
			</td>

			<td>
				<button
					@click="setStatus(form.id, 'Отклонено')"
					type="button">
					Отклонить
				</button>
			</td>
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

			if( session.role != 'admin' ) // если роль не админ, переадресовываем в личный кабинет
				return navigateTo('/lk');
		},
		data()
		{
			return {
				forms: [],
			};
		},
		methods: {
			async loadForms()
			{
				this.forms = await $fetch('/api/forms/all'); // запрос на загрузку всех заявок
			},

			async setStatus(form_id, status)
			{
				const success = await $fetch('/api/forms/change-status', { // запрос на изменение статуса
					method: 'POST',
					body: {
						form_id,
						status,
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