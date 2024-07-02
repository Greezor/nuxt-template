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