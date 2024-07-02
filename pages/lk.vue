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
			<label>
				<div>Изображение</div>
				<input
					type="file"
					accept=".png,.jpg,.jpeg"
					@input="convertImageToBase64">

				<img v-if="create_form.image" :src="create_form.image">
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
			<th>Изображение</th>
			<th>Статус</th>
		</tr>

		<tr v-for="form in forms">
			<td>{{ form.id }}</td>
			<td>{{ form.title }}</td>
			<td>{{ form.desc }}</td>
			<td>
				<img
					v-if="form.image"
					:src="form.image"
					width="200">
			</td>
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
					image: '',
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

				if( success ){
					for(let prop in this.create_form){ // очищаем форму, перебором всех свойств
						this.create_form[prop] = '';
					}

					this.loadForms(); // обновляем список заявок
				}else{
					alert('Ошибка!');
				}
			},

			convertImageToBase64(e)
			{
				const reader = new FileReader(); // создаём file reader
				reader.readAsDataURL(e.target.files[0]); // загружаем первый файл из input в формате dataURL
				reader.onload = () => {
					this.create_form.image = reader.result; // обновляем картинку
				}
			},
		},
		mounted()
		{
			this.loadForms(); // загружаем заявки при загрузке страницы
		},
	})
</script>