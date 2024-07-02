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