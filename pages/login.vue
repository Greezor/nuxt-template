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