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